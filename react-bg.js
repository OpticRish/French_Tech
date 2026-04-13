// LineWaves — Animated overlapping line waves background
const { useRef, useEffect } = React;

function LineWaves({
    speed = 0.3,
    innerLineCount = 32,
    outerLineCount = 36,
    warpIntensity = 1,
    rotation = -45,
    brightness = 0.2,
    color1 = "#ffffff",
    color2 = "#ffffff",
    color3 = "#ffffff",
    enableMouseInteraction = true,
    mouseInfluence = 2
}) {
    const canvasRef = useRef(null);
    const mouse = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2, vx: 0, vy: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { alpha: true });
        let w, h, animId;
        let time = 0;

        function resize() {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', resize);

        const onMouseMove = (e) => {
            if (!enableMouseInteraction) return;
            // Smooth mouse tracking
            mouse.current.tx = e.clientX;
            mouse.current.ty = e.clientY;
        };
        
        // initialize mouse target
        mouse.current.tx = w / 2;
        mouse.current.ty = h / 2;
        mouse.current.x = w / 2;
        mouse.current.y = h / 2;

        window.addEventListener('mousemove', onMouseMove);

        function draw() {
            time += speed * 0.01;
            
            // Lerp mouse
            mouse.current.x += (mouse.current.tx - mouse.current.x) * 0.05;
            mouse.current.y += (mouse.current.ty - mouse.current.y) * 0.05;

            ctx.clearRect(0, 0, w, h);
            ctx.save();
            
            // Rotate the entire canvas
            ctx.translate(w / 2, h / 2);
            ctx.rotate((rotation * Math.PI) / 180);
            ctx.translate(-w / 2, -h / 2);

            const mx = mouse.current.x;
            const my = mouse.current.y;
            
            // Draw lines
            const totalLines = innerLineCount + outerLineCount;
            const lineSpacing = Math.max(w, h) / totalLines;

            ctx.lineWidth = 1.5;
            
            for (let i = 0; i < totalLines; i++) {
                ctx.beginPath();
                
                // Color mapping (white since all 3 are white, but we'll use brightness)
                ctx.strokeStyle = `rgba(255, 255, 255, ${brightness})`;
                
                let yPos = (i - totalLines / 2) * lineSpacing * 1.5 + h / 2;
                
                for (let x = -w * 0.5; x <= w * 1.5; x += 10) {
                    
                    // Base wave math
                    let wave = Math.sin(x * 0.005 + time + i * 0.1) * 30 * warpIntensity;
                    wave += Math.cos(x * 0.002 - time + i * 0.05) * 50 * warpIntensity;

                    // Mouse influence warp
                    if (enableMouseInteraction) {
                        // Undo rotation for mouse position mathematically
                        const dx = x - w/2;
                        const dy = yPos - h/2;
                        const rad = (-rotation * Math.PI) / 180;
                        const unRotX = dx * Math.cos(rad) - dy * Math.sin(rad) + w/2;
                        const unRotY = dx * Math.sin(rad) + dy * Math.cos(rad) + h/2;

                        const distToMouse = Math.max(1, Math.sqrt((unRotX - mx) ** 2 + (unRotY - my) ** 2));
                        const influence = Math.max(0, 300 - distToMouse) / 300;
                        
                        wave += influence * 80 * mouseInfluence * Math.sin(time * 3 + i);
                    }

                    const finalY = yPos + wave;
                    
                    if (x === -w * 0.5) ctx.moveTo(x, finalY);
                    else ctx.lineTo(x, finalY);
                }
                ctx.stroke();
            }

            ctx.restore();
            animId = requestAnimationFrame(draw);
        }

        animId = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMouseMove);
        };
    }, [speed, innerLineCount, outerLineCount, warpIntensity, rotation, brightness, enableMouseInteraction, mouseInfluence]);

    return React.createElement('canvas', {
        ref: canvasRef,
        style: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
            pointerEvents: 'none',
        }
    });
}

// Mount LineWaves
const reactBgRoot = document.getElementById('react-bg-root');
if (reactBgRoot) {
    const root = ReactDOM.createRoot(reactBgRoot);
    root.render(React.createElement(LineWaves, {
        speed: 0.3,
        innerLineCount: 32,
        outerLineCount: 36,
        warpIntensity: 1,
        rotation: -45,
        edgeFadeWidth: 0,
        colorCycleSpeed: 1,
        brightness: 0.2,
        color1: "#ffffff",
        color2: "#ffffff",
        color3: "#ffffff",
        enableMouseInteraction: true,
        mouseInfluence: 2
    }));
}
