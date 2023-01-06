import { useRef, useState, FC } from 'react'
import * as THREE from 'three'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { data, DataType } from '../components/store'
import { useFrame, Canvas } from '@react-three/fiber';
import { useGLTF, Instances, Instance, Environment, OrbitControls } from '@react-three/drei'
import { useControls } from 'leva';

const ShoeClowd = () => {
  const { range } = useControls( {range: {value: 100, min: 0, max: 300, step: 10 }} )
  return (
    <Canvas camera={{ position: [0, 0, 20], fov: 50 }} performance={{ min: 0.1 }} style={{width: '100vw', height: '100vh'}}>
      <ambientLight intensity={1.5} />
      <directionalLight intensity={0.3} position={[5, 25, 20]} />
      <Shoes data={data} range={range} />
      <Environment preset='city' />
      <OrbitControls autoRotate autoRotateSpeed={1} />
    </Canvas>
  )
}

type GLTFResult = GLTF & {
  nodes: {
    Shoe: THREE.Mesh;
  };
  materials: {
    phong1SG: THREE.MeshStandardMaterial;
  };
};

type ShoesProps = {
  data: DataType[],
  range: number
}

const Shoes: FC<ShoesProps> = (props) => {
  const { nodes, materials } = useGLTF('/shoe.glb') as GLTFResult
  return (
    <Instances range={props.range} material={materials.phong1SG} geometry={nodes.Shoe.geometry}>
      <group position={[0, 0, 0]}>
        {data.map((props, i) => (
          <Shoe key={i} data={props} />
        ))}
      </group>
    </Instances>
  )
}

type ShoeProps = {
  data: DataType,
  color?: THREE.Color
}

const Shoe: FC<ShoeProps> = ({color = new THREE.Color(), ...props}) => {
  const ref = useRef<THREE.Object3D>(null)
  const [ hovered, setHover ] = useState(false)
  useFrame(state => {
    const t = state.clock.getElapsedTime() + props.data.random * 1000
    if (ref.current instanceof THREE.Object3D) {
      ref.current.rotation.set(Math.cos(t / 4) / 2, Math.sin(t / 4) / 2, Math.cos(t / 1.5) / 2)
      ref.current.position.y = Math.sin(t / 1.5) / 2
      ref.current.scale.x = ref.current.scale.y = ref.current.scale.z = THREE.MathUtils.lerp(ref.current.scale.z, hovered ? 1.4 : 1, 0.1)
      ref.current.color.lerp(color.set(hovered ? 'red' : 'white'), hovered ? 1 : 0.1)
    }
  })

  return (
    <group
      position={new THREE.Vector3(props.data.position[0], props.data.position[1], props.data.position[2])}
      rotation={new THREE.Euler(props.data.rotation[0], props.data.rotation[1], props.data.rotation[2])}
    >
      <Instance ref={ref} onPointerOver={e => (e.stopPropagation(), setHover(true))} onPointerOut={e => setHover(false)} />
    </group>
  )
}

export default ShoeClowd