import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";

const NODE_COUNT = 12;

function OrbitalRing({ radius, rotation, color, opacity = 0.45 }) {
    return (
        <mesh rotation={rotation}>
            <torusGeometry args={[radius, 0.009, 8, 160]} />
            <meshBasicMaterial
                color={color}
                transparent
                opacity={opacity}
            />
        </mesh>
    );
}

function ConnectionNodes() {
    const nodes = useMemo(() => {
        return Array.from({ length: NODE_COUNT }, (_, index) => {
            const angle = (index / NODE_COUNT) * Math.PI * 2;
            const radius = index % 3 === 0 ? 2.35 : 1.8;

            return {
                position: [
                    Math.cos(angle) * radius,
                    Math.sin(angle) * radius * 0.72,
                    Math.sin(angle * 2) * 0.4,
                ],
                color: ["#8B5CF6", "#22D3EE", "#C4B5FD"][
                    index % 3
                ],
                size: index % 3 === 0 ? 0.105 : 0.07,
            };
        });
    }, []);

    const lines = useMemo(() => {
        const positions = [];

        nodes.forEach((node, index) => {
            const next = nodes[(index + 1) % nodes.length];

            positions.push(...node.position, ...next.position);

            if (index % 2 === 0) {
                const other = nodes[(index + 4) % nodes.length];
                positions.push(...node.position, ...other.position);
            }
        });

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(positions, 3)
        );

        return geometry;
    }, [nodes]);

    return (
        <group>
            <lineSegments geometry={lines}>
                <lineBasicMaterial
                    color="#818CF8"
                    transparent
                    opacity={0.38}
                />
            </lineSegments>

            {nodes.map((node, index) => (
                <Float
                    key={index}
                    speed={1 + (index % 3) * 0.25}
                    rotationIntensity={0.15}
                    floatIntensity={0.35}
                >
                    <mesh position={node.position}>
                        <sphereGeometry
                            args={[node.size, 24, 24]}
                        />
                        <meshStandardMaterial
                            color={node.color}
                            emissive={node.color}
                            emissiveIntensity={2.5}
                            roughness={0.2}
                            metalness={0.25}
                        />
                    </mesh>
                </Float>
            ))}
        </group>
    );
}

function OrbitalCore() {
    return (
        <group>
            <mesh>
                <sphereGeometry args={[0.88, 64, 64]} />
                <meshPhysicalMaterial
                    color="#171747"
                    emissive="#4338CA"
                    emissiveIntensity={0.65}
                    roughness={0.25}
                    metalness={0.5}
                    clearcoat={1}
                    clearcoatRoughness={0.2}
                />
            </mesh>

            <mesh scale={1.04}>
                <sphereGeometry args={[0.88, 48, 48]} />
                <meshBasicMaterial
                    color="#8B5CF6"
                    wireframe
                    transparent
                    opacity={0.15}
                />
            </mesh>

            <OrbitalRing
                radius={1.2}
                rotation={[0.8, 0.3, 0.2]}
                color="#A78BFA"
            />

            <OrbitalRing
                radius={1.55}
                rotation={[1.2, 0.8, 0.4]}
                color="#22D3EE"
                opacity={0.3}
            />

            <OrbitalRing
                radius={2.05}
                rotation={[0.2, 1, 0.6]}
                color="#818CF8"
                opacity={0.25}
            />
        </group>
    );
}

function Scene() {
    return (
        <>
            <ambientLight intensity={1.1} />
            <pointLight
                position={[3, 3, 4]}
                intensity={35}
                color="#8B5CF6"
            />
            <pointLight
                position={[-3, -2, 2]}
                intensity={20}
                color="#22D3EE"
            />

            <Stars
                radius={40}
                depth={25}
                count={650}
                factor={2}
                saturation={0}
                fade
                speed={0.3}
            />

            <Float
                speed={0.65}
                rotationIntensity={0.08}
                floatIntensity={0.15}
            >
                <OrbitalCore />
                <ConnectionNodes />
            </Float>

            <OrbitControls
                enableZoom={false}
                enablePan={false}
                enableRotate
                autoRotate
                autoRotateSpeed={0.35}
                minPolarAngle={Math.PI / 3}
                maxPolarAngle={(Math.PI * 2) / 3}
            />
        </>
    );
}

export default function Hero3D() {
    return (
        <div className="nexora-3d-scene">
            <Canvas
                camera={{
                    position: [0, 0, 7.2],
                    fov: 42,
                }}
                dpr={[1, 1.5]}
                gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: "high-performance",
                }}
            >
                <Suspense fallback={null}>
                    <Scene />
                </Suspense>
            </Canvas>
        </div>
    );
}