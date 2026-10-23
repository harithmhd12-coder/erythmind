# Blender pass for a static model: weld, outward normals, smooth shading, and ambient occlusion baked into the colour map.
# usage: python bl_static.py -- in.glb out.glb [--ao 0.75] [--size 1024] [--render prefix]
import bpy, sys, math
import numpy as np
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:]
src, dst = argv[0], argv[1]
AO_K = float(argv[argv.index('--ao') + 1]) if '--ao' in argv else .75
SIZE = int(argv[argv.index('--size') + 1]) if '--size' in argv else 1024
render = argv[argv.index('--render') + 1] if '--render' in argv else None

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
meshes = [o for o in bpy.data.objects if o.type == 'MESH']

for m in meshes:
    bpy.ops.object.select_all(action='DESELECT'); m.select_set(True); bpy.context.view_layer.objects.active = m
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.remove_doubles(threshold=0.0002); bpy.ops.mesh.normals_make_consistent(inside=False)
    bpy.ops.object.mode_set(mode='OBJECT'); bpy.ops.object.shade_smooth()

# ---- ambient occlusion: baked per material into a new map, then multiplied into the base colour ----
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = 48
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True
w.light_settings.distance = 0                                     # AO distance is set on the bake below
done = {}
for m in meshes:
    if not m.data.uv_layers: continue
    for slot in m.material_slots:
        mat = slot.material
        if not mat or not mat.use_nodes or mat.name in done: continue
        nt = mat.node_tree
        bsdf = next((n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED'), None)
        if not bsdf or not bsdf.inputs['Base Color'].is_linked: continue
        tex = bsdf.inputs['Base Color'].links[0].from_node
        while tex.type != 'TEX_IMAGE' and tex.inputs and any(i.is_linked for i in tex.inputs):
            tex = next(i for i in tex.inputs if i.is_linked).links[0].from_node
        if tex.type != 'TEX_IMAGE' or not tex.image: continue
        base = tex.image; W, H = base.size
        ao = bpy.data.images.new(mat.name + '_ao', W, H, alpha=False, float_buffer=False)
        node = nt.nodes.new('ShaderNodeTexImage'); node.image = ao; nt.nodes.active = node
        done[mat.name] = (base, ao, node)

if done:
    bpy.ops.object.select_all(action='DESELECT')
    for m in meshes: m.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    dims = max(max(m.dimensions) for m in meshes if len(m.data.vertices) > 100)
    w.light_settings.distance = dims * .12                        # occlusion reach: about an eighth of the model
    print('AO distance', round(dims * .12, 3))
    sc.render.bake.margin = 6
    bpy.ops.object.bake(type='AO', margin=6, use_clear=True)
    for name, (base, ao, node) in done.items():
        b = np.array(base.pixels[:], dtype=np.float32).reshape(-1, 4)
        a = np.array(ao.pixels[:], dtype=np.float32).reshape(-1, 4)[:, 0:1]
        Wd, Hd = ao.size
        a2 = np.clip(a[:, 0], 0, 1).reshape(Hd, Wd); cov = (a2 > .02).astype(np.float32)
        # soften the occlusion inside each island (thin dark lines along seams and creases are bake artefacts, not shade)
        def box(x, r):
            for ax in (0, 1):
                c = np.cumsum(np.pad(x, [(r + 1, r) if i == ax else (0, 0) for i in range(2)], mode='edge'), axis=ax)
                x = (np.take(c, range(2 * r + 1, c.shape[ax]), axis=ax) - np.take(c, range(0, c.shape[ax] - 2 * r - 1), axis=ax)) / (2 * r + 1)
            return x
        r = max(2, Wd // 256)
        num = box(box(a2 * cov, r), r); den = box(box(cov, r), r)
        a2 = np.where(den > .05, num / np.maximum(den, 1e-4), 1)
        a2 = np.clip(a2, 0, 1) ** 1.1
        k = 1 - AO_K + AO_K * a2                                  # keep some light in the crevices
        inside = cov > 0
        if inside.any(): k = k / max(.5, float(k[inside].mean()))   # same overall brightness: crevices darker, open faces a touch lighter
        k[~inside] = 1                                            # the padding between UV islands keeps its colour (no dark seams)
        k = k.reshape(-1, 1); a = a2.reshape(-1, 1)
        b[:, :3] = np.clip(b[:, :3] * k, 0, 1)
        base.pixels[:] = b.ravel().tolist(); base.update()
        bpy.data.materials[name].node_tree.nodes.remove(node)
        bpy.data.images.remove(ao)
        print('AO', name, 'mean ao inside', round(float(a2[cov > 0].mean()) if (cov > 0).any() else 1, 3))

if render:
    sc.cycles.samples = 8; sc.render.resolution_x = 420; sc.render.resolution_y = 320
    w.node_tree.nodes['Background'].inputs[1].default_value = 1.3
    pts = [m.matrix_world @ Vector(c) for m in meshes for c in m.bound_box]
    lo = Vector([min(p[i] for p in pts) for i in range(3)]); hi = Vector([max(p[i] for p in pts) for i in range(3)]); c = (lo + hi) / 2; r = (hi - lo).length
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
    cam.location = c + Vector((r * .9, -r * 1.1, r * .55)); cam.rotation_euler = (c - cam.location).to_track_quat('-Z', 'Y').to_euler()
    sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN')); sun.data.energy = 3; sun.rotation_euler = (math.radians(45), 0, math.radians(35)); sc.collection.objects.link(sun)
    sc.render.filepath = render + '.png'; bpy.ops.render.render(write_still=True)

bpy.ops.export_scene.gltf(filepath=dst, export_format='GLB', export_image_format='JPEG', export_jpeg_quality=88)
print('OK', dst)
