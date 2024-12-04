import React, { useState, useRef, useEffect } from 'react';

const CanvasWithSVG = () => {
    const canvasRef = useRef(null);
    const [image, setImage] = useState(null);
    const [layers,setLayers] = useState([]);
    const [shapes, setShapes] = useState([]);
    const [draggingShape, setDraggingShape] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [currentLine, setCurrentLine] = useState([]);  // 현재 그릴 선의 좌표

    const imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png'; // 예시 이미지

    useEffect(() => {
        // 이미지를 로드하여 상태에 저장
        const img = new Image();
        img.src = imageUrl;
        img.onload = () => setImage(img);
    }, []);

    // 캔버스에 이미지와 도형을 그리는 함수
    const drawCanvas = (ctx) => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // 캔버스 초기화

        // 이미지 그리기
        if (image) {
            ctx.drawImage(image, 0, 0, ctx.canvas.width, ctx.canvas.height);
        }

        // 도형 그리기
        shapes.forEach((shape) => {
            ctx.fillStyle = shape.fill;
            if (shape.type === 'rect') {
                ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
            } else if (shape.type === 'circle') {
                ctx.beginPath();
                ctx.arc(shape.x, shape.y, shape.width / 2, 0, 2 * Math.PI);
                ctx.fill();
            } else if (shape.type === 'line') {
                ctx.beginPath();
                ctx.moveTo(shape.points[0].x, shape.points[0].y);
                shape.points.forEach(point => {
                    ctx.lineTo(point.x, point.y);
                });
                ctx.strokeStyle = 'black'; // 선 색상
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        });

        layers.forEach((layer) => {
            ctx.fillRect(layer.x,layer.y,layer.width,layer.height)
        })

        // 현재 그리는 선 그리기
        if (currentLine.length > 1) {
            ctx.beginPath();
            ctx.moveTo(currentLine[0].x, currentLine[0].y);
            currentLine.forEach(point => {
                ctx.lineTo(point.x, point.y);
            });
            ctx.strokeStyle = 'black'; // 선 색상
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    };
    const addLayer = () => {
        const newLayer = {
            id:Date.now(),
            x:0,
            y:0,
            width:600,
            height:600,
            fill:"rgba(0,0,0,1)"
        }

        setLayers(prev =>[...prev,newLayer]);
    }

    // 도형 추가 함수
    const addShape = (type) => {
        const newShape = {
            id: Date.now(),
            type: type,
            x: Math.random() * 400,
            y: Math.random() * 400,
            width: 100,
            height: 100,
            fill: 'rgba(255, 0, 0, 0.5)', // 기본 빨간색
        };
        setShapes([...shapes, newShape]);
    };

    // 마우스 이벤트 처리
    const handleMouseDown = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        // 클라이언트 좌표를 캔버스 좌표로 변환
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        // 마우스를 눌렀을 때 선을 그리기 시작
        setCurrentLine([{ x: offsetX, y: offsetY }]); // 선의 시작점

        // 도형을 클릭했는지 확인
        for (let i = 0; i < shapes.length; i++) {
            const shape = shapes[i];
            if (shape.type === 'rect') {
                if (
                    offsetX >= shape.x &&
                    offsetX <= shape.x + shape.width &&
                    offsetY >= shape.y &&
                    offsetY <= shape.y + shape.height
                ) {
                    setDraggingShape(shape);
                    setOffset({ x: offsetX - shape.x, y: offsetY - shape.y });
                    setIsDragging(true);
                    return;
                }
            } else if (shape.type === 'circle') {
                const dx = offsetX - shape.x;
                const dy = offsetY - shape.y;
                if (Math.sqrt(dx * dx + dy * dy) <= shape.width / 2) {
                    setDraggingShape(shape);
                    setOffset({ x: dx, y: dy });
                    setIsDragging(true);
                    return;
                }
            }
        }
    };

    // 마우스 움직임 처리 (그리기, 드래그)
    const handleMouseMove = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        // 클라이언트 좌표를 캔버스 좌표로 변환
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        if (isDragging && draggingShape) {
            // 도형 드래그 모드일 때는 도형 이동
            const newShapes = shapes.map((shape) =>
                shape.id === draggingShape.id
                    ? {
                        ...shape,
                        x: offsetX - offset.x,
                        y: offsetY - offset.y,
                    }
                    : shape
            );
            setShapes(newShapes);
        } else if (currentLine.length > 0) {
            // 마우스를 꾹 누르고 있을 때만 선을 계속 그리기
            setCurrentLine((prevLine) => [...prevLine, { x: offsetX, y: offsetY }]);
        }
    };

    console.log(currentLine,"currentLine");

    // 마우스 업 처리 (그리기, 드래그 종료)
    const handleMouseUp = () => {
        if (currentLine.length > 1) {
            // 그리기 종료 후 선을 shapes에 추가
            setShapes([...shapes, { id: Date.now(), type: 'line', points: currentLine }]);
            console.log("mouse up")
        }
        setIsDragging(false);
        setDraggingShape(null);
        setCurrentLine([]); // 그린 선을 초기화
    };

    useEffect(() => {
        // 캔버스 설정
        const canvas = canvasRef.current;
        console.log(canvasRef.current,"canvasRef.current");
        const ctx = canvas.getContext('2d');
        drawCanvas(ctx);

        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);

        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', handleMouseUp);
        };
    }, [layers,shapes, image, isDragging, draggingShape, currentLine]);

    return (
        <div style={{display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center"}}>
            <div>
                <button onClick={() => addShape('rect')}>Add Rectangle</button>
                <button onClick={() => addShape('circle')}>Add Circle</button>
                <button onClick={() => addLayer()}>Add Layer</button>
                <div onClick={() => {
                    const svgElement = canvasRef.current; // canvasRef가 <svg>를 참조해야 함

                    console.log(svgElement,"svgElement");
                    return;
                    if (svgElement) {
                        const svgString = new XMLSerializer().serializeToString(svgElement); // SVG를 문자열로 변환
                        const blob = new Blob([svgString], {type: 'image/svg+xml'});
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'my-icon.svg';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    } else {
                        console.error("SVG 엘리먼트를 찾을 수 없습니다.");
                    }
                }}>내보내기
                </div>
                <div onClick={() => {
                    canvasRef.current.exportPaths().then(res => console.log(res));
                }}>경로 내보내기
                </div>
            </div>
            <canvas
                ref={canvasRef}
                width={500}
                height={500}
                style={{border: '1px solid black', zIndex: 9999}}
            />
        </div>
    );
};

export default CanvasWithSVG;
