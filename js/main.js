
import {ARButton} from "https://unpkg.com/three@0.126.0/examples/jsm/webxr/ARButton.js";


let camera, scene, renderer 
let fbxLoader, controller, pointer
let hitTestSourceAvailable = false
let hitTestSource = null
let localSpace = null

init()
animate()
function init() {
    const container = document.createElement("div")
    document.body.appendChild(container)

    // Create a scene
    scene = new THREE.Scene()
    scene.name = "myScene"
    
    // Create a camera
    camera = new THREE.PerspectiveCamera(
        60, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        100
    )
    console.log(camera)
    scene.add(camera)
    
    // Create a renderer
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.xr.enabled = true

    container.appendChild(renderer.domElement)
    console.log(renderer)

    controller = renderer.xr.getController(0)
    console.log(controller)
    controller.addEventListener("select",onSelect, false)
    scene.add(controller)

    
    const ringGeometry = new THREE.RingBufferGeometry(0.15,0.25,16).rotateX(-Math.PI / 2)
    const ringMaterial = new THREE.MeshBasicMaterial()
    pointer = new THREE.Mesh(ringGeometry, ringMaterial)
    pointer.matrixAutoUpdate = false
    pointer.visible = false
    scene.add(pointer)

    const light = new THREE.HemisphereLight(0xffffff, 0x999999, 1)
    light.position.set(1, 1, 0.5)
    scene.add(light)

    const button = ARButton.createButton(renderer, {
        requiredFeatures: ["hit-test"]
    })
    document.body.appendChild(button)
}

function animate() {
    renderer.setAnimationLoop(render)
}

function render(timestamp, frame) {
    //rotateModel()
    if(frame){
        if(!hitTestSourceAvailable){
            initHitSource()
        }
        if(hitTestSourceAvailable){
     
            const hitTestResult = frame.getHitTestResults(hitTestSource)
            
            if(hitTestResult.length > 0){
                const hitPoint = hitTestResult[0]
                
                const pose = hitPoint.getPose(localSpace)
                pointer.matrix.fromArray(pose.transform.matrix)
                pointer.visible = true
            }
            else {
                pointer.visible = false
            }
        }
    }
    renderer.render(scene, camera)
}
function rotateModel() {

}

function onSelect() {
    console.log("tunnistettu")
    if(pointer.visible) {
        fbxLoader = new THREE.FBXLoader()
        fbxLoader.load( 'models/tennisball.fbx', function ( object ) {
        object.scale.set(.003, .003, .003)
        object.rotateZ(Math.PI / 2)
        object.position.setFromMatrixPosition(pointer.matrix)
        object.quaternion.setFromRotationMatrix(pointer.matrix)
        scene.add( object );
    
     } );
        //  const geometry = new THREE.SphereGeometry(0.2,0.4,16).rotateX(Math.PI / 2)
        //  const material = new THREE.MeshBasicMaterial({color: 0xff0000*Math.random()})
        //  const mesh = new THREE.Mesh(geometry, material)
        //  mesh.position.setFromMatrixPosition(pointer.matrix)
        //  mesh.quaternion.setFromRotationMatrix(pointer.matrix)
        //  scene.add(mesh)
     }
         
}

async function initHitSource() {
    const session = renderer.xr.getSession()
    const viewerSpace = await session.requestReferenceSpace("viewer")
    localSpace = await session.requestReferenceSpace("local")
    hitTestSource = await session.requestHitTestSource({space: viewerSpace})
    hitTestSourceAvailable = true
    console.log(hitTestSource)

    session.addEventListener("end", () => {
        hitTestSourceAvailable = false
        hitTestSource = null
    })
}