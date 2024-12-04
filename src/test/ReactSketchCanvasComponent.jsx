import React,{useRef,useState} from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";


const styles = {
    border: "0.0625rem solid #9c9c9c",
    borderRadius: "0.25rem",
    height:"1000px"
};


function ReactSketchCanvasComponent() {
    const [prevWorks,setPrevWorks] = useState([]);

    const canvasRef = useRef(null);
    return (
        <div>
            <div onClick={() => {
                canvasRef.current.clearCanvas()
            }}>지우기
            </div>
            <div onClick={() => {
                const svgElement = canvasRef.current; // canvasRef가 <svg>를 참조해야 함
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
                canvasRef.current.exportPaths().then(res => setPrevWorks(res));
            }}>경로 내보내기
            </div>
            <div onClick={() => {
                canvasRef.current.loadPaths(prevWorks)
            }}>
                불러오기
            </div>
            <ReactSketchCanvas
                backgroundImage="https://shoes-image-bucket.s3.ap-northeast-2.amazonaws.com/ecommerce/musinsa/shoes_20231127151454363555.jpg"
                ref={canvasRef}
                exportWithBackgroundImage
                style={styles} width="600" height="1000" strokeWidth={4} strokeColor="blue"/>
        </div>
    );
}

export default ReactSketchCanvasComponent;
