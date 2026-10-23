# Blender pass for a rigged humanoid (Meshy skeleton): clean the mesh, name the walk, add Rehat (idle) and Serang (attack).
# usage: python bl_char.py -- in.glb out.glb [--rig-from donor.glb] [--render prefix]
import bpy, sys, math
from mathutils import Matrix, Vector

argv = sys.argv[sys.argv.index('--') + 1:]
src, dst = argv[0], argv[1]
donor = argv[argv.index('--rig-from') + 1] if '--rig-from' in argv else None
render = argv[argv.index('--render') + 1] if '--render' in argv else None
FPS = 24

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.render.fps = FPS

def imp(path):
    before = set(bpy.data.objects); bpy.ops.import_scene.gltf(filepath=path); return [o for o in bpy.data.objects if o not in before]

objs = imp(src)
arm = next((o for o in objs if o.type == 'ARMATURE'), None)
meshes = [o for o in objs if o.type == 'MESH']

# stray helper meshes that are not skinned (Meshy leaves an icosphere marker)
for m in list(meshes):
    if m.name.lower().startswith('icosphere') or (arm and not any(md.type == 'ARMATURE' for md in m.modifiers) and len(m.data.vertices) < 100):
        meshes.remove(m); bpy.data.objects.remove(m, do_unlink=True)

# an unrigged body borrows a donor skeleton, fitted to its size, and is skinned with automatic weights
if arm is None and donor:
    dobjs = imp(donor); arm = next(o for o in dobjs if o.type == 'ARMATURE')
    for o in dobjs:
        if o.type == 'MESH': bpy.data.objects.remove(o, do_unlink=True)
    body = max(meshes, key=lambda m: len(m.data.vertices))
    def bbox(o):
        pts = [o.matrix_world @ Vector(c) for c in o.bound_box]; return Vector([min(p[i] for p in pts) for i in range(3)]), Vector([max(p[i] for p in pts) for i in range(3)])
    bpy.context.view_layer.update()
    # the donor's own body box, measured from its bones (skinned meshes were removed)
    bones = [arm.matrix_world @ b.head_local for b in arm.data.bones] + [arm.matrix_world @ b.tail_local for b in arm.data.bones]
    dmin = Vector([min(p[i] for p in bones) for i in range(3)]); dmax = Vector([max(p[i] for p in bones) for i in range(3)])
    bmin, bmax = bbox(body)
    s = (bmax.z - bmin.z) / (dmax.z - dmin.z) * 1.0
    arm.scale = arm.scale * s; bpy.context.view_layer.update()
    bones = [arm.matrix_world @ b.head_local for b in arm.data.bones]
    dmin = Vector([min(p[i] for p in bones) for i in range(3)]); dmax = Vector([max(p[i] for p in bones) for i in range(3)])
    dc = (dmin + dmax) / 2; bc = (bmin + bmax) / 2
    arm.location = arm.location + Vector((bc.x - dc.x, bc.y - dc.y, bmin.z - dmin.z + 0.0))
    bpy.context.view_layer.update()
    bpy.ops.object.select_all(action='DESELECT'); body.select_set(True); arm.select_set(True); bpy.context.view_layer.objects.active = arm
    bpy.ops.object.parent_set(type='ARMATURE_AUTO')
    print('auto-rigged', body.name, 'scale', s)

# mesh: weld split vertices, consistent outward normals, smooth shading
for m in meshes:
    if not m.name in bpy.data.objects: continue
    bpy.ops.object.select_all(action='DESELECT'); m.select_set(True); bpy.context.view_layer.objects.active = m
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.remove_doubles(threshold=0.0004); bpy.ops.mesh.normals_make_consistent(inside=False)
    bpy.ops.object.mode_set(mode='OBJECT'); bpy.ops.object.shade_smooth()

# the walk keeps its clip, under a plain name
walk = None
for a in bpy.data.actions:
    if a.users or True: walk = a
if walk: walk.name = 'Jalan'; walk.use_fake_user = True

# ---- poses: rotations given in armature space (Z up, the character faces -Y, its left is +X) ----
pb = arm.pose.bones
ORDER = [b.name for b in arm.data.bones]                     # parents come before children
for p in pb: p.rotation_mode = 'QUATERNION'
def has(n): return n in pb
def pose(rots):
    for p in pb: p.rotation_quaternion = (1, 0, 0, 0); p.location = (0, 0, 0)
    bpy.context.view_layer.update()
    for name in ORDER:
        if name not in rots: continue
        p = pb[name]; axis, deg = rots[name]
        head = p.matrix.to_translation()
        p.matrix = Matrix.Translation(head) @ Matrix.Rotation(math.radians(deg), 4, Vector(axis)) @ Matrix.Translation(-head) @ p.matrix
        bpy.context.view_layer.update()
def key(frame, names):
    for n in names:
        if has(n): pb[n].keyframe_insert('rotation_quaternion', frame=frame)
# ---- body axes, measured on the skinned mesh itself (bone names on these rigs do not say which way the body faces) ----
body = max([m for m in bpy.data.objects if m.type == 'MESH' and m.vertex_groups], key=lambda m: len(m.data.vertices))
M3 = arm.matrix_world.to_3x3().normalized()
def centroid(group):
    vg = body.vertex_groups.get(group)
    if vg is None: return None
    bpy.context.view_layer.update(); dg = bpy.context.evaluated_depsgraph_get(); me = body.evaluated_get(dg).to_mesh()
    idx = vg.index; acc = Vector(); n = 0
    for v, v0 in zip(me.vertices, body.data.vertices):
        for g in v0.groups:
            if g.group == idx and g.weight > .05: acc += (body.matrix_world @ v.co) * g.weight; n += g.weight; break
    if n: return acc / n
    # no skin on this bone: use the posed bone's own head
    return arm.matrix_world @ pb[group].head if group in pb else None
def rest():
    for p in pb: p.rotation_quaternion = (1, 0, 0, 0); p.location = (0, 0, 0)
    bpy.context.view_layer.update()
UPw = Vector((0, 0, 1))
# forward: where the walk carries the hips; else where the toes point from the heels
FWDw = None
if walk:
    arm.animation_data_create(); arm.animation_data.action = walk
    f0, f1 = int(walk.frame_range[0]), int(walk.frame_range[1]); sc0 = bpy.context.scene
    sc0.frame_set(f0); h0 = arm.matrix_world @ pb['Hips'].head; sc0.frame_set(f1); h1 = arm.matrix_world @ pb['Hips'].head
    d = h1 - h0; d.z = 0
    if d.length > .05: FWDw = d.normalized()
    arm.animation_data.action = None
rest()
toes = [centroid(n) for n in ('LeftToeBase', 'RightToeBase')]; heels = [centroid(n) for n in ('LeftFoot', 'RightFoot')]
dT = (toes[0] + toes[1]) - (heels[0] + heels[1]); dT.z = 0
print('FWD walk', FWDw and [round(v, 2) for v in FWDw], 'toes', [round(v, 2) for v in dT.normalized()])
if FWDw is None:
    toes = [centroid(n) for n in ('LeftToeBase', 'RightToeBase')]; heels = [centroid(n) for n in ('LeftFoot', 'RightFoot')]
    d = (toes[0] + toes[1]) - (heels[0] + heels[1]); d.z = 0; FWDw = d.normalized()
RH, LH = centroid('RightHand'), centroid('LeftHand')
Rw = RH - LH; Rw = (Rw - FWDw * Rw.dot(FWDw)); Rw.z = 0; Rw.normalize()
print('AXES fwd', [round(v, 2) for v in FWDw], 'right', [round(v, 2) for v in Rw])
# rotation axes in armature space
inv = M3.inverted()
SIDE, FWD, UP = tuple((inv @ Rw).normalized()), tuple((inv @ FWDw).normalized()), tuple((inv @ UPw).normalized())
SIGN = {}
def sign_for(bone, axis, group, goal):
    """+1 or -1: the direction of turning `bone` about `axis` that moves `group` toward `goal` (world)"""
    k = (bone, axis, group, tuple(goal))
    if k in SIGN: return SIGN[k]
    rest(); c0 = centroid(group); best = 1; bd = -1e9
    for sgn in (1, -1):
        pose({bone:(axis, 25 * sgn)}); c1 = centroid(group); d = (c1 - c0).dot(goal)
        if d > bd: bd, best = d, sgn
    rest(); SIGN[k] = best; return best
ALL = ['Hips', 'Spine02', 'Spine01', 'Spine', 'neck', 'Head', 'LeftShoulder', 'LeftArm', 'LeftForeArm', 'LeftHand', 'RightShoulder', 'RightArm', 'RightForeArm', 'RightHand', 'LeftUpLeg', 'LeftLeg', 'RightUpLeg', 'RightLeg']
center = (RH + LH) / 2
sRA_f = sign_for('RightArm', SIDE, 'RightHand', FWDw + UPw * .4)                # right arm swings forward and up
sLA_f = sign_for('LeftArm', SIDE, 'LeftHand', FWDw)                            # left arm forward
sRA_in = sign_for('RightArm', FWD, 'RightHand', -Rw)                           # right arm in toward the body
sLA_in = sign_for('LeftArm', FWD, 'LeftHand', Rw)
sRF_f = sign_for('RightForeArm', SIDE, 'RightHand', FWDw + UPw * .4)
sLF_f = sign_for('LeftForeArm', SIDE, 'LeftHand', FWDw + UPw * .4)
sTw = sign_for('Spine', UP, 'RightArm', FWDw)                                  # twist that brings the right shoulder forward
sLean = sign_for('Spine02', SIDE, 'Head', FWDw)                                # lean forward
print('SIGNS', sRA_f, sLA_f, sRA_in, sLA_in, sRF_f, sLF_f, sTw, sLean)

def new_action(name):
    act = bpy.data.actions.new(name); act.use_fake_user = True
    arm.animation_data_create(); arm.animation_data.action = act
    return act

# Rehat: standing at ease, breathing, a slow glance, arms relaxed at the sides (3 s loop)
new_action('Rehat')
for f in range(0, 73, 6):
    ph = f / 72 * 2 * math.pi
    pose({'Spine02':(SIDE, sLean * (1.5 + 1.5 * math.sin(ph))), 'Spine':(SIDE, -sLean * .8 * math.sin(ph)),
          'Head':(UP, 6 * math.sin(ph * .5)),
          'RightArm':(FWD, sRA_in * (6 + 1.5 * math.sin(ph))), 'LeftArm':(FWD, sLA_in * (6 + 1.5 * math.sin(ph))),
          'RightForeArm':(SIDE, sRF_f * 10), 'LeftForeArm':(SIDE, sLF_f * 10)})
    key(f, ALL)

# Serang: wind up, drive the right arm forward and up with the body behind it, hold, recover (1.4 s)
new_action('Serang')
seq = [
  (0,  {}),
  (7,  {'Spine':(UP, -sTw * 16), 'Spine02':(SIDE, -sLean * 5), 'RightArm':(SIDE, -sRA_f * 30), 'RightForeArm':(SIDE, sRF_f * 40), 'LeftArm':(SIDE, sLA_f * 25)}),
  (12, {'Spine':(UP, sTw * 20), 'Spine02':(SIDE, sLean * 10), 'RightArm':(SIDE, sRA_f * 85), 'RightForeArm':(SIDE, sRF_f * 5), 'LeftArm':(SIDE, -sLA_f * 20)}),
  (21, {'Spine':(UP, sTw * 18), 'Spine02':(SIDE, sLean * 9), 'RightArm':(SIDE, sRA_f * 80), 'RightForeArm':(SIDE, sRF_f * 8), 'LeftArm':(SIDE, -sLA_f * 18)}),
  (34, {}),
]
for f, r in seq: pose(r); key(f, ALL)
FWD_v, LEFT_v = FWDw, -Rw

# stash every action on the NLA so the exporter writes each as its own clip
arm.animation_data.action = None
for tr in list(arm.animation_data.nla_tracks): arm.animation_data.nla_tracks.remove(tr)
for a in [x for x in bpy.data.actions if x.name in ('Jalan', 'Rehat', 'Serang')]:
    tr = arm.animation_data.nla_tracks.new(); tr.name = a.name; tr.strips.new(a.name, int(a.frame_range[0]), a)
for a in list(bpy.data.actions):
    if a.name not in ('Jalan', 'Rehat', 'Serang'): bpy.data.actions.remove(a)

if render:
    sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.samples = 8; sc.cycles.device = 'CPU'
    sc.render.resolution_x = 360; sc.render.resolution_y = 480
    w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[1].default_value = 1.2
    body = max([m for m in bpy.data.objects if m.type == 'MESH'], key=lambda m: len(m.data.vertices))
    bpy.context.view_layer.update()
    pts = [body.matrix_world @ Vector(c) for c in body.bound_box]; h = max(p.z for p in pts) - min(p.z for p in pts); cz = (max(p.z for p in pts) + min(p.z for p in pts)) / 2
    cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
    fw = FWD_v; lf = LEFT_v
    c = Vector((sum(p.x for p in pts) / 8, sum(p.y for p in pts) / 8, cz))
    cam.location = c + fw * h * 2.3 + lf * h * .9 + Vector((0, 0, h * .1))
    cam.rotation_euler = (c - cam.location).to_track_quat('-Z', 'Y').to_euler()
    sun = bpy.data.objects.new('sun', bpy.data.lights.new('sun', 'SUN')); sun.data.energy = 3; sun.rotation_euler = (math.radians(50), 0, math.radians(30)); sc.collection.objects.link(sun)
    for tr in arm.animation_data.nla_tracks: tr.mute = True
    for name, frame in (('Rehat', 0), ('Serang', 12), ('Jalan', 12)):
        for tr in arm.animation_data.nla_tracks: tr.mute = tr.name != name
        sc.frame_set(frame); sc.render.filepath = f'{render}-{name}.png'; bpy.ops.render.render(write_still=True)

# face the game's forward: glTF +Z, which is Blender -Y
ang = math.atan2(-1, 0) - math.atan2(FWD_v.y, FWD_v.x)
arm.rotation_mode = 'XYZ'; arm.rotation_euler.z += ang
print('TURN', round(math.degrees(ang), 1))
bpy.ops.export_scene.gltf(filepath=dst, export_format='GLB', export_animation_mode='NLA_TRACKS', export_skins=True, export_yup=True, export_apply=False, export_image_format='AUTO')
print('OK', dst)
