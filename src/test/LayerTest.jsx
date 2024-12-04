import React, { useRef, useState, useEffect } from "react";

const LayerTest = () => {
    const canvasRef = useRef(null);
    const [layers, setLayers] = useState([]);
    const [selectedLayer, setSelectedLayer] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentLine, setCurrentLine] = useState(null);

    // 캔버스에 레이어 및 선 그리기
    const drawLayers = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        layers.forEach((layer, index) => {
            // 레이어 렌더링
            ctx.globalAlpha = layer.visible ? 1 : 0.3;
            ctx.fillStyle = layer.color;
            ctx.fillRect(layer.x, layer.y, layer.width, layer.height);

            // 레이어 내 선 렌더링
            layer.lines.forEach((line) => {
                ctx.beginPath();
                ctx.moveTo(line.startX + layer.x, line.startY + layer.y);
                ctx.lineTo(line.endX + layer.x, line.endY + layer.y);
                ctx.strokeStyle = "black";
                ctx.lineWidth = 2;
                ctx.stroke();
            });

            // 선택된 레이어 표시
            if (index === selectedLayer) {
                ctx.strokeStyle = "blue";
                ctx.lineWidth = 2;
                ctx.strokeRect(layer.x, layer.y, layer.width, layer.height);
            }
        });
        ctx.globalAlpha = 1; // 투명도 초기화
    };

    useEffect(() => {
        drawLayers();
    }, [layers, selectedLayer]);

    // 레이어 추가
    const addLayer = () => {
        const newLayer = {
            x: Math.random() * 400,
            y: Math.random() * 300,
            width: 100,
            height: 100,
            color: `hsl(${Math.random() * 360}, 50%, 60%)`,
            visible: true,
            lines: [],
        };
        setLayers((prev) => [...prev, newLayer]);
    };

    // 레이어 삭제
    const removeLayer = () => {
        if (selectedLayer !== null) {
            setLayers((prev) => prev.filter((_,index)=> index !== selectedLayer));
            setSelectedLayer(null);
        }
    };

    // 클릭으로 레이어 선택
    const handleCanvasClick = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // 클릭한 레이어 찾기
        const clickedLayerIndex = layers.findIndex(
            (layer) =>
                mouseX >= layer.x &&
                mouseX <= layer.x + layer.width &&
                mouseY >= layer.y &&
                mouseY <= layer.y + layer.height
        );

        setSelectedLayer(clickedLayerIndex !== -1 ? clickedLayerIndex : null);
    };

    // 선 그리기 시작
    const handleMouseDown = (e) => {
        if (selectedLayer !== null) {
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            setIsDrawing(true);
            setCurrentLine({
                startX: mouseX - layers[selectedLayer].x,
                startY: mouseY - layers[selectedLayer].y,
                endX: mouseX - layers[selectedLayer].x,
                endY: mouseY - layers[selectedLayer].y,
            });
        }
    };

    // 선 그리기 중
    const handleMouseMove = (e) => {
        if (isDrawing && selectedLayer !== null && currentLine) {
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            setCurrentLine((prev) => ({
                ...prev,
                endX: mouseX - layers[selectedLayer].x,
                endY: mouseY - layers[selectedLayer].y,
            }));
        }
    };

    // 선 그리기 종료
    const handleMouseUp = () => {
        if (isDrawing && selectedLayer !== null && currentLine) {
            setLayers((prev) =>
                prev.map((layer, index) =>
                    index === selectedLayer
                        ? { ...layer, lines: [...layer.lines, currentLine] }
                        : layer
                )
            );
        }
        setIsDrawing(false);
        setCurrentLine(null);
    };

    return (
        <div>
            <canvas
                ref={canvasRef}
                width={500}
                height={400}
                style={{ border: "1px solid black" }}
                onClick={handleCanvasClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            ></canvas>
            <div style={{ marginTop: "10px" }}>
                <button onClick={addLayer}>레이어 추가</button>
                <button onClick={removeLayer}>레이어 삭제</button>
            </div>
        </div>
    );
};

export default LayerTest;

