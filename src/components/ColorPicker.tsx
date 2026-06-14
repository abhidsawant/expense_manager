import React, { useRef, useState, useCallback } from 'react';
import { View, StyleSheet, PanResponder, LayoutChangeEvent } from 'react-native';

// ── helpers ───────────────────────────────────────────────────────────────────

function hsvToHex(h: number, s: number, v: number): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    const c = v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
    return Math.round(c * 255).toString(16).padStart(2, '0');
  };
  return `#${f(5)}${f(3)}${f(1)}`;
}

function hexToHsv(hex: string): [number, number, number] {
  const c = hex.replace('#', '');
  if (c.length !== 6) return [0, 1, 1];
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d + 6) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return [h, max ? d / max : 0, max];
}

function clamp(val: number, lo = 0, hi = 1) { return Math.max(lo, Math.min(hi, val)); }

const HUE_STOPS = Array.from({ length: 13 }, (_, i) => hsvToHex(i * 30, 1, 1));
const SB_ROWS = 20, SB_COLS = 20;

function buildSbGrid(hue: number) {
  return Array.from({ length: SB_ROWS }, (_, row) => {
    const v = 1 - row / (SB_ROWS - 1);
    return Array.from({ length: SB_COLS }, (_, col) => hsvToHex(hue, col / (SB_COLS - 1), v));
  });
}

// ── component ─────────────────────────────────────────────────────────────────

type Props = { color: string; onChange: (hex: string) => void };

export default function ColorPicker({ color, onChange }: Props) {
  const isValid = /^#[0-9a-fA-F]{6}$/.test(color);
  const init = isValid ? hexToHsv(color) : [0, 1, 1] as [number, number, number];

  // All mutable values live in refs so PanResponder closures always see current values
  const hueRef = useRef(init[0]);
  const satRef = useRef(init[1]);
  const briRef = useRef(init[2]);

  // Separate display state so we can trigger re-renders
  const [hue, setHue] = useState(init[0]);
  const [sat, setSat] = useState(init[1]);
  const [bri, setBri] = useState(init[2]);

  // Layout info stored as refs
  const sbLayout = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const hueLayout = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const sbViewRef = useRef<View>(null);
  const hueViewRef = useRef<View>(null);

  const emit = useCallback((nh: number, ns: number, nb: number) => {
    onChange(hsvToHex(nh, ns, nb));
  }, [onChange]);

  // ── SB responder ──────────────────────────────────────────────────────────
  const sbResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => {
      const { width, height } = sbLayout.current;
      if (!width) return;
      const ns = clamp((e.nativeEvent.pageX - sbLayout.current.x) / width);
      const nb = clamp(1 - (e.nativeEvent.pageY - sbLayout.current.y) / height);
      satRef.current = ns; briRef.current = nb;
      setSat(ns); setBri(nb);
      emit(hueRef.current, ns, nb);
    },
    onPanResponderMove: (e) => {
      const { width, height } = sbLayout.current;
      if (!width) return;
      const ns = clamp((e.nativeEvent.pageX - sbLayout.current.x) / width);
      const nb = clamp(1 - (e.nativeEvent.pageY - sbLayout.current.y) / height);
      satRef.current = ns; briRef.current = nb;
      setSat(ns); setBri(nb);
      emit(hueRef.current, ns, nb);
    },
  })).current;

  // ── Hue responder ─────────────────────────────────────────────────────────
  const hueResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => {
      const { width } = hueLayout.current;
      if (!width) return;
      const nh = clamp((e.nativeEvent.pageX - hueLayout.current.x) / width) * 360;
      hueRef.current = nh;
      setHue(nh);
      emit(nh, satRef.current, briRef.current);
    },
    onPanResponderMove: (e) => {
      const { width } = hueLayout.current;
      if (!width) return;
      const nh = clamp((e.nativeEvent.pageX - hueLayout.current.x) / width) * 360;
      hueRef.current = nh;
      setHue(nh);
      emit(nh, satRef.current, briRef.current);
    },
  })).current;

  const measureSb = () => {
    sbViewRef.current?.measure((_fx, _fy, width, height, px, py) => {
      sbLayout.current = { x: px, y: py, width, height };
    });
  };

  const measureHue = () => {
    hueViewRef.current?.measure((_fx, _fy, width, height, px, py) => {
      hueLayout.current = { x: px, y: py, width, height };
    });
  };

  return (
    <View style={styles.wrap}>
      {/* Saturation / Brightness square */}
      <View
        ref={sbViewRef}
        style={styles.sbOuter}
        onLayout={measureSb}
        {...sbResponder.panHandlers}
      >
        {buildSbGrid(hue).map((row, ri) => (
          <View key={ri} style={styles.sbRow}>
            {row.map((c, ci) => <View key={ci} style={[styles.sbCell, { backgroundColor: c }]} />)}
          </View>
        ))}
        <View
          pointerEvents="none"
          style={[styles.thumb, { left: `${sat * 100}%` as any, top: `${(1 - bri) * 100}%` as any }]}
        />
      </View>

      {/* Hue bar */}
      <View
        ref={hueViewRef}
        style={styles.hueBar}
        onLayout={measureHue}
        {...hueResponder.panHandlers}
      >
        <View style={styles.hueTrack}>
          {HUE_STOPS.map((stop, i) => <View key={i} style={[styles.hueStop, { backgroundColor: stop }]} />)}
        </View>
        <View
          pointerEvents="none"
          style={[styles.thumb, styles.hueThumb, { left: `${(hue / 360) * 100}%` as any }]}
        />
      </View>
    </View>
  );
}

const THUMB = 24;

const styles = StyleSheet.create({
  wrap: { gap: 16 },
  sbOuter: { width: '100%', aspectRatio: 1, borderRadius: 16, overflow: 'hidden' },
  sbRow: { flex: 1, flexDirection: 'row' },
  sbCell: { flex: 1 },
  hueBar: { height: 32, borderRadius: 16, justifyContent: 'center' },
  hueTrack: { flexDirection: 'row', height: 32, borderRadius: 16, overflow: 'hidden' },
  hueStop: { flex: 1 },
  thumb: {
    position: 'absolute',
    width: THUMB, height: THUMB, borderRadius: THUMB / 2,
    borderWidth: 3, borderColor: '#fff',
    marginLeft: -(THUMB / 2), marginTop: -(THUMB / 2),
    shadowColor: '#000', shadowOpacity: 0.6, shadowRadius: 6, elevation: 8,
  },
  hueThumb: { top: '50%' as any },
});
