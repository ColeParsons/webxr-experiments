import * as THREE from "./node_modules/three/build/three.module.js"


function Mesh(data, mesher, scaleFactor) {
    this.data = data
    const geometry = this.geometry = new THREE.Geometry()
    this.scale = scaleFactor || new THREE.Vector3(10, 10, 10)

    const result = mesher.mesh(data.voxels, data.dims)
    this.meshed = result

    geometry.vertices.length = 0
    geometry.faces.length = 0

    for (let i = 0; i < result.vertices.length; ++i) {
        let q = result.vertices[i]
        geometry.vertices.push(new THREE.Vector3(q[0], q[1], q[2]))
    }

    for (let i = 0; i < result.faces.length; ++i) {
        const uv = this.faceVertexUv(i)

        let q = result.faces[i]
        if (q.length === 5) {
            geometry.faceVertexUvs[0].push([uv[1],uv[0],uv[2]])
            const f = new THREE.Face3(q[0], q[1], q[2])
            f.color = new THREE.Color(q[4])
            geometry.faces.push(f)

            geometry.faceVertexUvs[0].push([uv[2],uv[0],uv[1]])
            const f2 = new THREE.Face3(q[0],q[2],q[3])
            f2.color = new THREE.Color(q[4])
            geometry.faces.push(f2)
        }
    }

    geometry.computeFaceNormals()
    geometry.uvsNeedUpdate = true
    geometry.verticesNeedUpdate = true
    geometry.elementsNeedUpdate = true
    geometry.normalsNeedUpdate = true

    geometry.computeBoundingBox()
    geometry.computeBoundingSphere()

}

Mesh.prototype.createWireMesh = function(hexColor) {
    var wireMaterial = new THREE.MeshBasicMaterial({
        color : hexColor || 0xffffff,
        wireframe : true
    })
    const wireMesh = new THREE.Mesh(this.geometry, wireMaterial)
    this.surfaceMesh.scale.copy(this.scale)
    this.wireMesh = wireMesh
    return wireMesh
}

Mesh.prototype.createSurfaceMesh = function(material) {
    material = material || new THREE.MeshNormalMaterial()
    const surfaceMesh  = new THREE.Mesh( this.geometry, material )
    surfaceMesh.scale.copy(this.scale)
    this.surfaceMesh = surfaceMesh
    return surfaceMesh
}

Mesh.prototype.addToScene = function(scene) {
    if (this.wireMesh) scene.add( this.wireMesh )
    if (this.surfaceMesh) scene.add( this.surfaceMesh )
}

Mesh.prototype.setPosition = function(x, y, z) {
    if (this.wireMesh) this.wireMesh.position = new THREE.Vector3(x, y, z)
    if (this.surfaceMesh) this.surfaceMesh.position = new THREE.Vector3(x, y, z)
}

Mesh.prototype.faceVertexUv = function(i) {
    var vs = [
        this.meshed.vertices[i*4+0],
        this.meshed.vertices[i*4+1],
        this.meshed.vertices[i*4+2],
        this.meshed.vertices[i*4+3]
    ]
    var spans = {
        x0: vs[0][0] - vs[1][0],
        x1: vs[1][0] - vs[2][0],
        y0: vs[0][1] - vs[1][1],
        y1: vs[1][1] - vs[2][1],
        z0: vs[0][2] - vs[1][2],
        z1: vs[1][2] - vs[2][2]
    }
    var size = {
        x: Math.max(Math.abs(spans.x0), Math.abs(spans.x1)),
        y: Math.max(Math.abs(spans.y0), Math.abs(spans.y1)),
        z: Math.max(Math.abs(spans.z0), Math.abs(spans.z1))
    }
    if (size.x === 0) {
        if (spans.y0 > spans.y1) {
            var width = size.y
            var height = size.z
        }
        else {
            var width = size.z
            var height = size.y
        }
    }
    if (size.y === 0) {
        if (spans.x0 > spans.x1) {
            var width = size.x
            var height = size.z
        }
        else {
            var width = size.z
            var height = size.x
        }
    }
    if (size.z === 0) {
        if (spans.x0 > spans.x1) {
            var width = size.x
            var height = size.y
        }
        else {
            var width = size.y
            var height = size.x
        }
    }
    if ((size.z === 0 && spans.x0 < spans.x1) || (size.x === 0 && spans.y0 > spans.y1)) {
        return [
            new THREE.Vector2(height, 0),
            new THREE.Vector2(0, 0),
            new THREE.Vector2(0, width),
            new THREE.Vector2(height, width)
        ]
    } else {
        return [
            new THREE.Vector2(0, 0),
            new THREE.Vector2(0, height),
            new THREE.Vector2(width, height),
            new THREE.Vector2(width, 0)
        ]
    }
}
;


export const VoxelMesh = Mesh
