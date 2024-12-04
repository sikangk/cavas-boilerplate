import React, { useEffect, useState, useRef } from 'react';
import { Stage, Layer, Image } from 'react-konva';
import useImage from 'use-image';
import Konva from 'konva';

function ReactKonva() {
    const dragUrl = useRef();
    const stageRef = useRef();
    const [images, setImages] = useState([]);

    const onClickDeleteChattingRoom = (e) => {
        e?.preventDefault();
        alert('채팅방을 정말 삭제하시겠어요?');
    };

    const URLImage = ({ image }) => {
        const [img] = useImage(image.src);
        return (
            <Image
                image={img}
                x={image.x}
                y={image.y}
                offsetX={img ? img.width / 2 : 0}
                offsetY={img ? img.height / 2 : 0}
                draggable={true}
                onDragStart={(e) => {
                    dragUrl.current = e.target.src;
                }}
                onContextMenu={(e) => onClickDeleteChattingRoom(e)}
            />
        );
    };

    useEffect(() => {
        if (stageRef.current) {
            // Stage와 Layer가 완전히 렌더링된 후에 getLayer() 호출
            const layers = stageRef.current.getLayers();
            if (layers && layers.length > 0) {
                console.log('Layers:', layers[0]); // 레이어가 정상적으로 렌더링된 경우
            } else {
                console.log('No layers found yet.');
            }
        }
    }, [stageRef.current, images]);

    const handleSaveLayer = (layerIndex) => {
        const layer = stageRef.current?.getLayers()[layerIndex];
        if (layer) {
            const layerJSON = layer.toJSON();
            localStorage.setItem(`layer_${layerIndex}`, layerJSON);
            alert(`Layer ${layerIndex} saved!`);
        } else {
            console.log('Layer not found!');
        }
    };

    const handleRestoreLayer = (layerIndex) => {
        const savedLayerJSON = localStorage.getItem(`layer_${layerIndex}`);
        if (savedLayerJSON) {
            const stage = stageRef.current.getStage();
            const layer = stage.getLayers()[layerIndex];
            if (layer) {
                // layer.destroyChildren();
                Konva.Node.create(savedLayerJSON, layer);
                layer.batchDraw();
                alert(`Layer ${layerIndex} restored!`);
            }
        } else {
            alert(`No saved state for Layer ${layerIndex}`);
        }
    };

    return (
        <div>
            Try to drag and image into the stage:
            <button onClick={() => handleSaveLayer(0)}>레이어 저장</button>
            <button onClick={() => handleRestoreLayer(0)}>레이어 복구</button>
            <br />
            <img
                alt="lion"
                src="https://konvajs.org/assets/lion.png"
                draggable="true"
                onDragStart={(e) => {
                    dragUrl.current = e.target.src;
                }}
            />
            <div
                onDrop={(e) => {
                    e.preventDefault();
                    stageRef.current.setPointersPositions(e);
                    setImages([
                        ...images,
                        {
                            ...stageRef.current.getPointerPosition(),
                            src: dragUrl.current,
                        },
                    ]);
                }}
                onDragOver={(e) => e.preventDefault()}
            >
                <Stage
                    width={window.innerWidth}
                    height={window.innerHeight}
                    style={{ border: '1px solid grey' }}
                    ref={stageRef}
                >
                    <Layer>
                        {images.map((image, index) => (
                            <URLImage key={index} image={image} />
                        ))}
                    </Layer>
                </Stage>
            </div>
        </div>
    );
}

export default ReactKonva;
