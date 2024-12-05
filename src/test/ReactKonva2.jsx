import React, { useRef, useState } from "react";
import { Stage, Layer, Rect, Circle, Line, Image } from "react-konva";

const App = () => {
    const stageRef = useRef(null);

    // 상태 관리
    const [layers, setLayers] = useState([
        { id: "레이어-1", shapes: [], opacity: 1 }, // 초기 레이어
    ]);
    const [selectedLayerId, setSelectedLayerId] = useState("레이어-1");
    const [currentLine, setCurrentLine] = useState(null);
    const [scale, setScale] = useState(1);
    const [lastDistance, setLastDistance] = useState(null);
    const [buttonState,setButtonState] = useState({
        isPinchZoomEnabled:false,
        isDrawing:false,
        isShape:false,
    })
    const [shapeType, setShapeType] = useState("rect");
    const [startPos, setStartPos] = useState(null); // 드래그 시작 좌표
    const [newShape, setNewShape] = useState(null); // 현재 생성 중인 도형

    const buttonHandle = (which) => {

        switch (which) {
            case "draw":
                return setButtonState({isPinchZoomEnabled: false,isDrawing: true,isShape: false});
            case "pinch":
                return setButtonState({isPinchZoomEnabled: true,isDrawing: false,isShape:false});
            case "shape":
                return setButtonState({isPinchZoomEnabled: false,isDrawing: false,isShape:true});
            default:
                return setButtonState({isPinchZoomEnabled: true,isDrawing: false,isShape: false})

        }
    }

    console.log(buttonState,"buttonState");

    // 레이어 추가
    const addLayer = () => {
        const newLayer = {
            id: `레이어-${layers.length + 1}`,
            shapes: [],
            opacity: 1, // 기본 투명도
        };
        setLayers([...layers, newLayer]);
        setSelectedLayerId(newLayer.id);
    };

    // 레이어 삭제
    const deleteLayer = (layerId) => {
        if (layers.length === 1) {
            alert("최소 한 개의 레이어는 필요합니다!");
            return;
        }
        setLayers(layers.filter((layer) => layer.id !== layerId));
        if (selectedLayerId === layerId) {
            setSelectedLayerId(layers[0].id); // 첫 번째 레이어 선택
        }
    };

    // 도형 추가 (사각형 예시)
    const addShapeToLayer = () => {
        const newShape = {
            id: `rect-${Date.now()}`,
            type: "rect",
            x: Math.random() * 300,
            y: Math.random() * 300,
            width: 100,
            height: 50,
            fill: "blue",
            draggable: true,
        };
        setLayers((prevLayers) =>
            prevLayers.map((layer) =>
                layer.id === selectedLayerId
                    ? { ...layer, shapes: [...layer.shapes, newShape] }
                    : layer
            )
        );
    };

    // 드로잉 모드 토글
    // const toggleDrawingMode = () => {
    //     setIsDrawing(!isDrawing);
    // };

    const getRelativePointerPosition = (stage) => {
        const transform = stage.getAbsoluteTransform().copy();
        transform.invert();
        const pos = stage.getPointerPosition();
        return transform.point(pos);
    };


    const handleDrawMouseDown = (e) => {
        if (!buttonState.isDrawing) return;

        const stage = e.target.getStage();
        const pos = getRelativePointerPosition(stage); // 상대 좌표로 변환
        const newLine = {
            id: `line-${Date.now()}`,
            type: "line",
            points: [pos.x, pos.y],
            stroke: "black",
            strokeWidth: 3,
            lineCap: "round",
            lineJoin: "round",
        };
        setCurrentLine(newLine);
        setLayers((prevLayers) =>
            prevLayers.map((layer) =>
                layer.id === selectedLayerId
                    ? { ...layer, shapes: [...layer.shapes, newLine] }
                    : layer
            )
        );
    };

    // handleMouseMove 수정
    const handleDrawMouseMove = (e) => {
        if (!buttonState.isDrawing || !currentLine) return;

        const stage = e.target.getStage();
        const pos = getRelativePointerPosition(stage); // 상대 좌표로 변환

        if (buttonState.isDrawing) {

            setCurrentLine((prevLine) => {
                const updatedLine = {
                    ...prevLine,
                    points: [...prevLine.points, pos.x, pos.y],
                };
                setLayers((prevLayers) =>
                    prevLayers.map((layer) =>
                        layer.id === selectedLayerId
                            ? {
                                ...layer,
                                shapes: layer.shapes.map((shape) =>
                                    shape.id === prevLine.id ? updatedLine : shape
                                ),
                            }
                            : layer
                    )
                );
                return updatedLine;
            });
        }else if(buttonState.isShape){
            const width = Math.abs(pos.x - startPos.x);
            const height = Math.abs(pos.y - startPos.y);

            const x = Math.min(pos.x, startPos.x);
            const y = Math.min(pos.y, startPos.y);

            if (shapeType === "rect") {
                setNewShape({ x, y, width, height, type: "rect", fill: "rgba(0,0,255,0.5)" });
            } else if (shapeType === "circle") {
                const radius = Math.sqrt(width ** 2 + height ** 2) / 2;
                setNewShape({
                    x: (pos.x + startPos.x) / 2,
                    y: (pos.y + startPos.y) / 2,
                    radius,
                    type: "circle",
                    fill: "rgba(255,0,0,0.5)",
                });
            }
        }
    };

    const handleDrawMouseUp = () => {
        if (buttonState.isPinchZoomEnabled) return; // 핀치 줌 비활성화 시 동작 중지
        if (!buttonState.isDrawing) return;

        if(buttonState.isDrawing) setCurrentLine(null); // 드로잉 종료

        if(buttonState.isShape){
            setLayers((prevLayers) =>
                prevLayers.map((layer) =>
                    layer.id === selectedLayerId
                        ? { ...layer, shapes: [...layer.shapes, { ...newShape, id: `shape-${Date.now()}` }] }
                        : layer
                )
            );
            setStartPos(null); // 시작 좌표 초기화
            setNewShape(null); // 임시 도형 초기화
        }
    };

    const handleShapeMouseDown = (e) => {
        if (!buttonState.isShape) return; // 드로잉 모드 확인
        const stage = e.target.getStage();
        const pos = getRelativePointerPosition(stage); // 상대 좌표 계산
        setStartPos(pos); // 시작 좌표 저장
    };

// 드래그 이동 처리
    const handleShapeMouseMove = (e) => {
        if (!buttonState.isShape || !startPos) return;
        const stage = e.target.getStage();
        const pos = getRelativePointerPosition(stage);

        const width = Math.abs(pos.x - startPos.x);
        const height = Math.abs(pos.y - startPos.y);

        const x = Math.min(pos.x, startPos.x);
        const y = Math.min(pos.y, startPos.y);

        if (shapeType === "rect") {
            setNewShape({ x, y, width, height, type: "rect", fill: "rgba(0,0,255,0.5)" });
        } else if (shapeType === "circle") {
            const radius = Math.sqrt(width ** 2 + height ** 2) / 2;
            setNewShape({
                x: (pos.x + startPos.x) / 2,
                y: (pos.y + startPos.y) / 2,
                radius,
                type: "circle",
                fill: "rgba(255,0,0,0.5)",
            });
        }
    };

// 드래그 종료 처리
    const handleShapeMouseUp = (e) => {
        if (!buttonState.isShape || !startPos) return;
        setLayers((prevLayers) =>
            prevLayers.map((layer) =>
                layer.id === selectedLayerId
                    ? { ...layer, shapes: [...layer.shapes, { ...newShape, id: `shape-${Date.now()}` }] }
                    : layer
            )
        );
        setStartPos(null); // 시작 좌표 초기화
        setNewShape(null); // 임시 도형 초기화
    };



    // 투명도 조정
    const changeLayerOpacity = (value) => {
        setLayers((prevLayers) =>
            prevLayers.map((layer) =>
                layer.id === selectedLayerId
                    ? { ...layer, opacity: Math.min(Math.max(value, 0), 1) } // 0~1 범위 제한
                    : layer
            )
        );
    };

    // JSON으로 저장
    const saveToJSON = () => {
        try {
            const jsonString = JSON.stringify(layers);
            localStorage.setItem("konvaLayers", jsonString);
            alert("저장 완료!");
        } catch (error) {
            console.error("저장 중 오류 발생:", error);
            alert("저장에 실패했습니다!");
        }
    };

    // JSON에서 불러오기
    const loadFromJSON = () => {
        try {
            const savedJSON = localStorage.getItem("konvaLayers");
            if (!savedJSON) {
                alert("저장된 작업이 없습니다!");
                return;
            }

            const parsedLayers = JSON.parse(savedJSON);

            if (!Array.isArray(parsedLayers)) {
                throw new Error("잘못된 데이터 형식입니다.");
            }

            setLayers(parsedLayers);

            if (!selectedLayerId && parsedLayers.length > 0) {
                setSelectedLayerId(parsedLayers[0].id);
            }

            alert("불러오기 완료!");
        } catch (error) {
            console.error("불러오기 중 오류 발생:", error);
            alert("불러오기에 실패했습니다!");
        }
    };

    const updateShapeInLayer = (shapeId, updatedProps) => {
        setLayers((prevLayers) =>
            prevLayers.map((layer) =>
                layer.id === selectedLayerId
                    ? {
                        ...layer,
                        shapes: layer.shapes.map((shape) =>
                            shape.id === shapeId ? { ...shape, ...updatedProps } : shape
                        ),
                    }
                    : layer
            )
        );
    };

    const getDistance = (touches) => {
        const [touch1, touch2] = touches;
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchMove = (e) => {
        if (!buttonState.isPinchZoomEnabled) return; // 핀치 줌 비활성화 시 동작 중지

        e.evt.preventDefault(); // 기본 브라우저 동작 방지
        if (e.evt.touches.length === 2) {
            const distance = getDistance(e.evt.touches);
            if (lastDistance !== null) {
                const scaleBy = distance / lastDistance;
                const stage = stageRef.current;
                const oldScale = stage.scaleX();
                const newScale = oldScale * scaleBy;

                // 스테이지 중심을 기준으로 줌 설정
                const mousePointTo = {
                    x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
                    y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
                };

                stage.scale({ x: newScale, y: newScale });

                const newPos = {
                    x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
                    y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale,
                };

                stage.position(newPos);
                stage.batchDraw();
            }
            setLastDistance(distance);
        }
    };

    const handleTouchEnd = () => {
        if (!buttonState.isPinchZoomEnabled) return; // 핀치 줌 비활성화 시 동작 중지
        setLastDistance(null);
    };

    const handleWheel = (e) => {
        if (!buttonState.isPinchZoomEnabled) return; // 핀치 줌 비활성화 시 동작 중지

        e.evt.preventDefault(); // 기본 스크롤 방지
        const stage = stageRef.current;

        // 스케일 조정
        const scaleBy = 1.05;
        const oldScale = stage.scaleX();
        const newScale =
            e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

        const mousePointTo = {
            x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
            y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
        };

        stage.scale({ x: newScale, y: newScale });

        const newPos = {
            x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
            y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale,
        };

        stage.position(newPos);
        stage.batchDraw();
    };

    const backgroundImage = new window.Image();
    backgroundImage.src = "https://shoes-image-bucket.s3.ap-northeast-2.amazonaws.com/ecommerce/musinsa/shoes_20231127151454363555.jpg"; // 이미지 경로



    return (
        <div style={{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center"}}>
            {/* UI Buttons */}
            <div style={{display:"flex",flexDirection:"column"}}>
                <div>
                    <button
                        onClick={() => buttonHandle("pinch")}
                    >
                        {buttonHandle.isPinchZoomEnabled ? "드래그 / 줌" : "드래그 / 줌 종료"}
                    </button>
                    <button onClick={addShapeToLayer}>도형 추가</button>
                    <button onClick={() => buttonHandle("draw")}>
                        {buttonState.isDrawing ? "드로잉 종료" : "드로잉 시작"}
                    </button>
                    <button onClick={() => {
                        setShapeType("rect");
                        buttonHandle("shape");
                    }}>사각형</button>
                    <button onClick={() => {
                        setShapeType("circle");
                        buttonHandle("shape");
                    }}>원</button>
                    <button onClick={saveToJSON}>저장</button>
                    <button onClick={loadFromJSON}>불러오기</button>
                    <button onClick={() => changeLayerOpacity(0.1)}>투명도 낮추기</button>
                    <button onClick={() => changeLayerOpacity(1)}>투명도 높이기</button>
                </div>
                <div>
                    <button onClick={addLayer}>레이어 추가</button>
                    <button onClick={() => deleteLayer(selectedLayerId)}>레이어 삭제</button>
                </div>
            </div>
            <div>
                {layers.map((layer) => (
                    <button
                        key={layer.id}
                        onClick={() => setSelectedLayerId(layer.id)}
                        style={{
                            fontWeight: layer.id === selectedLayerId ? "bold" : "normal",
                        }}
                    >
                        {layer.id}
                    </button>
                ))}
            </div>

            {/* Konva Stage */}
            <Stage
                width={800}
                height={800}
                ref={stageRef}
                style={{ border: "1px solid gray" }}
                onMouseDown={(buttonState.isDrawing || buttonState.isPinchZoomEnabled) ? handleDrawMouseDown : handleShapeMouseDown}
                onMouseMove={(buttonState.isDrawing || buttonState.isPinchZoomEnabled) ? handleDrawMouseMove : handleShapeMouseMove}
                onMouseUp={(buttonState.isDrawing || buttonState.isPinchZoomEnabled) ? handleDrawMouseUp : handleShapeMouseUp}
                draggable={buttonState.isPinchZoomEnabled}
                // scaleX={scale}
                // scaleY={scale}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onWheel={handleWheel}
            >
                {layers.map((layer) => (
                    <Layer key={layer.id} opacity={layer.opacity} width={800} height={800}>
                        {/*<image src={"https://shoes-image-bucket.s3.ap-northeast-2.amazonaws.com/ecommerce/musinsa/shoes_20231127151454363555.jpg"} style={{width:500,height:500}}/>*/}
                        {/*<Image*/}
                        {/*    image={backgroundImage}*/}
                        {/*    width={800} // 이미지 크기*/}
                        {/*    height={800}*/}
                        {/*/>*/}
                        {layer.shapes.map((shape) => {
                            if (shape.type === "rect") {
                                return (
                                    <Rect
                                        key={shape.id}
                                        {...shape}
                                        onDragEnd={(e) => {
                                            const pos = e.target.position();
                                            updateShapeInLayer(shape.id, { x: pos.x, y: pos.y });
                                        }}
                                    />
                                );
                            }
                            if (shape.type === "circle") {
                                return (
                                    <Circle
                                        key={shape.id}
                                        {...shape}
                                        onDragEnd={(e) => {
                                            const pos = e.target.position();
                                            updateShapeInLayer(shape.id, { x: pos.x, y: pos.y });
                                        }}
                                    />
                                );
                            }
                            if (shape.type === "line") {
                                return <Line key={shape.id} {...shape} />;
                            }
                            return null;
                        })}
                        {/* 임시 도형 */}
                        {newShape && shapeType === "rect" && (
                            <Rect
                                x={newShape.x}
                                y={newShape.y}
                                width={newShape.width}
                                height={newShape.height}
                                fill={newShape.fill}
                                stroke="black"
                                strokeWidth={2}
                                dash={[4, 4]} // 점선
                                draggable={true}
                                onDragEnd={(e) => {
                                    const pos = e.target.position();
                                    updateShapeInLayer(newShape.id, { x: newShape.x, y: newShape.y });
                                }}
                            />
                        )}
                        {newShape && shapeType === "circle" && (
                            <Circle
                                x={newShape.x}
                                y={newShape.y}
                                radius={newShape.radius}
                                fill={newShape.fill}
                                stroke="black"
                                strokeWidth={2}
                                dash={[4, 4]} // 점선
                                draggable={true}
                                onDragEnd={(e) => {
                                    const pos = e.target.position();
                                    updateShapeInLayer(newShape.id, { x: newShape.x, y: newShape.y });
                                }}
                            />
                        )}
                    </Layer>
                ))}
            </Stage>
        </div>
    );
};

export default App;
