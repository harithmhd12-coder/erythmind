# Blender passes for the Erythmind models

Run with Blender as a Python module (`pip install bpy`, Blender 5.2):

- `bl_char.py in.glb out.glb [--rig-from donor.glb] [--render prefix]`
  Rigged humanoids (Meshy skeleton). Welds the mesh, measures which way the body faces from the skin itself,
  turns it to face glTF +Z, keeps the walk as `Jalan` and adds `Rehat` (breathing idle) and `Serang` (attack).
  An unrigged body gets the donor's skeleton fitted to its height and is skinned with automatic weights.
- `bl_static.py in.glb out.glb [--ao 0.75] [--render prefix]`
  Static models. Welds, outward normals, smooth shading, and ambient occlusion baked (Cycles) into the colour map:
  softened inside each UV island, the same overall brightness, padding untouched.

The output is then shrunk as before: textures to 512/1024 JPEG, `gltfpack -cc -noq -kn -km` (characters `-si 0.4`).
