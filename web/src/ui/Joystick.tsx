import { useEffect, useRef, useState, useCallback } from 'react';
import type { Coordinate } from '../geo';
import { projectCoordinate } from '../geo';

interface JoystickProps {
  current: Coordinate;
  onMove: (next: Coordinate) => void;
  speedMps: number;
  disabled?: boolean;
}

const MAX_RADIUS = 45; // pixels from center

export function Joystick({ current, onMove, speedMps, disabled }: JoystickProps) {
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);
  const vectorRef = useRef({ vx: 0, vy: 0 }); // -1..1 for x (east/west) and y (north/south)
  const currentRef = useRef(current);
  currentRef.current = current;

  const baseRef = useRef<HTMLDivElement>(null);
  const activeKeys = useRef<Set<string>>(new Set());

  // Reset joystick to neutral state
  const resetJoystick = useCallback(() => {
    vectorRef.current = { vx: 0, vy: 0 };
    setKnobPos({ x: 0, y: 0 });
    setIsInteracting(false);
    activeKeys.current.clear();
  }, []);

  // Update vector from pointer coordinate
  const handlePointerMove = (e: PointerEvent) => {
    if (!baseRef.current) return;
    const rect = baseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist === 0) {
      vectorRef.current = { vx: 0, vy: 0 };
      setKnobPos({ x: 0, y: 0 });
      return;
    }

    const angle = Math.atan2(dy, dx);
    const clampedDist = Math.min(dist, MAX_RADIUS);
    const clampedX = Math.cos(angle) * clampedDist;
    const clampedY = Math.sin(angle) * clampedDist;

    setKnobPos({ x: clampedX, y: clampedY });
    // vx: positive = east, negative = west
    // vy: positive = north (up), negative = south (down). Note: screen dy is positive downward.
    vectorRef.current = {
      vx: clampedX / MAX_RADIUS,
      vy: -clampedY / MAX_RADIUS,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    setIsInteracting(true);
    e.currentTarget.setPointerCapture(e.pointerId);

    const onPointerMoveWindow = (ev: PointerEvent) => handlePointerMove(ev);
    const onPointerUpWindow = () => {
      resetJoystick();
      window.removeEventListener('pointermove', onPointerMoveWindow);
      window.removeEventListener('pointerup', onPointerUpWindow);
      window.removeEventListener('pointercancel', onPointerUpWindow);
    };

    window.addEventListener('pointermove', onPointerMoveWindow);
    window.addEventListener('pointerup', onPointerUpWindow);
    window.addEventListener('pointercancel', onPointerUpWindow);
  };

  // Keyboard navigation: WASD and Arrow Keys (ignored inside text inputs)
  useEffect(() => {
    if (disabled) return;

    const isInputFocused = () => {
      const active = document.activeElement;
      if (!active) return false;
      const tag = active.tagName.toLowerCase();
      return tag === 'input' || tag === 'textarea' || tag === 'select' || (active as HTMLElement).isContentEditable;
    };

    const updateKeyboardVector = () => {
      let vx = 0;
      let vy = 0;
      if (activeKeys.current.has('KeyW') || activeKeys.current.has('ArrowUp')) vy += 1;
      if (activeKeys.current.has('KeyS') || activeKeys.current.has('ArrowDown')) vy -= 1;
      if (activeKeys.current.has('KeyD') || activeKeys.current.has('ArrowRight')) vx += 1;
      if (activeKeys.current.has('KeyA') || activeKeys.current.has('ArrowLeft')) vx -= 1;

      // Normalize if diagonal
      const len = Math.sqrt(vx * vx + vy * vy);
      if (len > 0) {
        vx /= len;
        vy /= len;
      }

      vectorRef.current = { vx, vy };
      setKnobPos({ x: vx * MAX_RADIUS, y: -vy * MAX_RADIUS });
      setIsInteracting(len > 0);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isInputFocused()) return;
      const valid = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      if (valid.includes(e.code)) {
        e.preventDefault();
        activeKeys.current.add(e.code);
        updateKeyboardVector();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (activeKeys.current.has(e.code)) {
        activeKeys.current.delete(e.code);
        updateKeyboardVector();
      }
    };

    const handleBlur = () => {
      resetJoystick();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [disabled, resetJoystick]);

  // Motion Loop with monotonic timer and capped delta (max 200ms per tick) to prevent jump after freeze
  useEffect(() => {
    if (disabled) return;

    let lastTime = performance.now();
    let animId: number;

    const tick = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;

      // Cap delta time to max 0.2s (200ms) to prevent leap if tab was backgrounded or suspended
      const dt = Math.min(rawDt, 0.2);

      const { vx, vy } = vectorRef.current;
      if (vx !== 0 || vy !== 0) {
        const distMeters = speedMps * dt;
        // Direction in degrees: 0 = North, 90 = East, 180 = South, 270 = West
        const angleRad = Math.atan2(vx, vy); // vx=east, vy=north
        const bearingDeg = ((angleRad * 180) / Math.PI + 360) % 360;

        try {
          const next = projectCoordinate(currentRef.current, bearingDeg, distMeters);
          onMove(next);
        } catch {
          // Keep current if coordinate boundary exceeded
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [disabled, speedMps, onMove]);

  return (
    <div className="joystick-wrapper" title="Controle por toque ou teclado (W/A/S/D ou Setas)">
      <div
        ref={baseRef}
        className={`joystick-base ${isInteracting ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
        onPointerDown={handlePointerDown}
      >
        <div className="joystick-ring" />
        <div
          className="joystick-knob"
          style={{ transform: `translate(${knobPos.x}px, ${knobPos.y}px)` }}
        />
        <div className="joystick-axis axis-n">N</div>
        <div className="joystick-axis axis-s">S</div>
        <div className="joystick-axis axis-e">L</div>
        <div className="joystick-axis axis-w">O</div>
      </div>
      <small className="joystick-label">Joystick: Teclado W/A/S/D ou arraste</small>
    </div>
  );
}
