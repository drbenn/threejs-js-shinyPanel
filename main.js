import * as THREE from 'three'
import gsap from 'gsap'
import * as dat from 'dat.gui'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"


console.log(OrbitControls);
const gui = new dat.GUI()
const world = {
  plane: {
    width:5,
    height: 5,
    widthSegments:5,
    heightSegments:5,
  }
}

gui.add(world.plane, 'width', 1,50).onChange(generatePlane)
gui.add(world.plane, 'height', 1,50).onChange(generatePlane)
gui.add(world.plane, 'widthSegments', 1,50).onChange(generatePlane)
gui.add(world.plane, 'heightSegments', 1,50).onChange(generatePlane)

function generatePlane() {
  planeMesh.geometry.dispose()
  planeMesh.geometry = new THREE.PlaneGeometry(
    world.plane.width, 
    world.plane.height,
    world.plane.widthSegments,
    world.plane.heightSegments
    )
  console.log(world.plane.width);


// COLOR ATTRIBUTE ADDITION

// !!!OBJECT DESTRUCTURING, { array } is actually equal to "planeMesh.geometry.attributes.position.array"
// array property is taken from the long chain and the const is named array so it can be used below in array.length
// and it will be clearer and easier on the eyes

const { array } = planeMesh.geometry.attributes.position
for (let i = 0; i < array.length; i+= 3) {
  const x = array[i]
  const y = array[i + 1]
  const z = array[i + 2]

  array[i +2] = z + Math.random()
}

const colors = []
for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) 
{
  colors.push(0,0.19,0.4)
}
console.log(colors);
// Add property to geometry
//  Need to account for count of 363 total vertices, which are 121 groups of 3(x,y,z coords)
planeMesh.geometry.setAttribute(
'color', 
new THREE.BufferAttribute(new 
  Float32Array(colors), 3)
)

}


const raycaster = new THREE.Raycaster()
console.log(raycaster);
// Scene holds objects, cameras and lights
const scene = new THREE.Scene()

// window.innerWidth / window.innerHeight is the aspect ratio - and this will always give
// the full width/height of the browser window on render
// 3rd argument(0.1) is near clipping plane, how close to camera before getting removed from view
// 4th arg(1000) is far clipping plance, how far out before object not rendered
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

// Renders graphics to scene
// renderer needs to know which element to render on, thus canvas with id of bg
const renderer = new THREE.WebGL1Renderer()

// console.log(scene)
// console.log(camera)
// console.log(renderer)

// Inject renderer into html
renderer.setSize(window.innerWidth, innerHeight)
// reduces object pixel jaggidness
renderer.setPixelRatio(devicePixelRatio)
document.body.appendChild(renderer.domElement)

// const boxGeometry = new THREE.BoxGeometry(1,1,1);
// // console.log(boxGeometry);
// // material gives color/texture - "wrapping paper" - cant write custom shaders in WebGL to do this too
// // Most materials need light source, but because basic material, it does not need a light source
// // const material = new THREE.MeshBasicMaterial({color: 0xFF6347, wireframe:true});

// // Standard material reacts to light bouncing off it
// const material = new THREE.MeshBasicMaterial({color: 0x00ffd0});
// // console.log(material);

// const mesh = new THREE.Mesh(boxGeometry,material);
// // console.log(mesh);
// scene.add(mesh)




// OrbitControls
new OrbitControls(camera, renderer.domElement)

// camera will default render to center, thus changing position to actually see object
camera.position.z = 5;



const planeGeometry = new THREE.PlaneGeometry(5,5, 5,5);
console.log(planeGeometry);
// Phong material requires light on scene to illuminate
const planeMaterial = new THREE.MeshPhongMaterial( {

  side: THREE.DoubleSide, 
  flatShading:THREE.FlatShading,
  vertexColors: true

} );
const planeMesh = new THREE.Mesh(planeGeometry,planeMaterial);
scene.add(planeMesh)






// Vertice position randomization
const { array } = planeMesh.geometry.attributes.position
const randomValues = []
for (let i = 0; i < array.length; i+= 3) {

  if (i% 3 ===0) {
  const x = array[i]
  const y = array[i + 1]
  const z = array[i + 2]

  array[i] = x + (Math.random() - 0.5)
  array[i +1] = y + (Math.random() - 0.5)
  array[i +2] = z + Math.random()
  }
  randomValues.push(Math.random())
}

planeMesh.geometry.attributes.position.randomValues = randomValues

planeMesh.geometry.attributes.position.originalPosition = planeMesh.geometry.attributes.position.array

// COLOR ATTRIBUTE ADDITION - Initial Load
const colors = []
for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) 
{colors.push(0,0.19,0.4)}
console.log(colors);
// Add property to geometry
//  Need to account for count of 363 total vertices, which are 121 groups of 3(x,y,z coords)
planeMesh.geometry.setAttribute(
'color', 
new THREE.BufferAttribute(new 
  Float32Array(colors), 3)
)













const light = new THREE.DirectionalLight(0xffffff,1)
light.position.set(0,0,1)
scene.add(light)

const backLight = new THREE.DirectionalLight(0xffffff,1)
backLight.position.set(0,0,-1)
scene.add(backLight)


const mouse = {
  x: undefined,
  y:undefined
}

// Instead of a single render, function animate acts more like a game loop to rerender as the scene changes continually
let frame = 0
function animate() {
  requestAnimationFrame(animate);
  // mesh.rotation.x += 0.01;
  // mesh.rotation.y += 0.01;
  // mesh.rotation.z += 0.01;
  planeMesh.rotation.x += 0.00;
  // controls.update();
  renderer.render(scene, camera);
  raycaster.setFromCamera(mouse, camera)
  frame += 0.01


  const { array, originalPosition, randomValues } =planeMesh.geometry.attributes.position

  for (let i = 0; i < array.length; i+= 3) {
      array[i] = originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.01


  }


  planeMesh.geometry.attributes.position.needsUpdate = true




  const intersects = raycaster.intersectObject(planeMesh)
  if (intersects.length > 0) {
    console.log(intersects[0].face);

    const { color } = intersects[0].object.geometry.attributes
    intersects[0].object.geometry.attributes.color.needsUpdate = true

    const initialColor = {
      r: 0,
      g: .19,
      b: .4
    }

    const hoverColor = {
      r: 0.1,
      g: .5,
      b: 1
    }

    gsap.to(hoverColor, {
      r: initialColor.r,
      g: initialColor.g,
      b: initialColor.b,
      onUpdate: () => {
        // vertice 1
        color.setX(intersects[0].face.a, hoverColor.r)
        color.setY(intersects[0].face.a, hoverColor.g)
        color.setZ(intersects[0].face.a,  hoverColor.b)

        // vertice 2
        color.setX(intersects[0].face.b, hoverColor.r)
        color.setY(intersects[0].face.b, hoverColor.g)
        color.setZ(intersects[0].face.b, hoverColor.b)

        // vertice 3
        color.setX(intersects[0].face.c, hoverColor.r)
        color.setY(intersects[0].face.c, hoverColor.g)
        color.setZ(intersects[0].face.c, hoverColor.b)

        color.needsUpdate = true
      }})}
  console.log(intersects);
}

animate();

addEventListener('mousemove', (event)=>
{
  mouse.x = (event.clientX / innerWidth) * 2 - 1
  mouse.y = -(event.clientY / innerHeight) *2 + 1
  console.log(mouse);
})