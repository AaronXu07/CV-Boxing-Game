import { useState, useRef, useCallback, useEffect } from 'react';

// Reusable pause + resume countdown hook.
// Usage:
// const { isPaused, isResuming, resumeCountdown, pause, resume, isPausedRef, lastFrameRef } = usePause({
//   countdownSeconds: 3,
//   enableCountdown: true,
//   onToggle: (paused) => playButtonSound(),
//   allowPause: () => true // or (gameState) => gameState !== GAME_STATE.READY
// });
// Then call pause(canvasRef, ctxRef) / resume(canvasRef, ctxRef) passing refs.

export function usePause({
	countdownSeconds = 3,
	enableCountdown = true,
	onToggle = () => {},
	allowPause = () => true // (optionalPredicateArg) => boolean
} = {}) {
	const [isPaused, setIsPaused] = useState(false);
	const [isResuming, setIsResuming] = useState(false);
	const [resumeCountdown, setResumeCountdown] = useState(0);

	const isPausedRef = useRef(false);
	const lastFrameRef = useRef(null);
	const resumeTimerRef = useRef(null);

	const clearCountdown = useCallback(() => {
		if (resumeTimerRef.current) {
			clearInterval(resumeTimerRef.current);
			resumeTimerRef.current = null;
		}
		setIsResuming(false);
		setResumeCountdown(0);
	}, []);

	const captureFrame = useCallback((canvasRef, ctxRef) => {
		if (!canvasRef?.current || !ctxRef?.current) return;
		try {
			const canvas = canvasRef.current;
			lastFrameRef.current = ctxRef.current.getImageData(0, 0, canvas.width, canvas.height);
		} catch {
			lastFrameRef.current = null;
		}
	}, []);

	const startCountdown = useCallback(() => {
		if (!enableCountdown) {
			// Direct resume
			isPausedRef.current = false;
			setIsPaused(false);
			lastFrameRef.current = null;
			onToggle(false);
			return;
		}
		setIsResuming(true);
		setResumeCountdown(countdownSeconds);
		if (resumeTimerRef.current) clearInterval(resumeTimerRef.current);
		resumeTimerRef.current = setInterval(() => {
			setResumeCountdown(prev => {
				if (prev <= 1) {
					clearInterval(resumeTimerRef.current);
					resumeTimerRef.current = null;
					setIsResuming(false);
					setResumeCountdown(0);
					isPausedRef.current = false;
					setIsPaused(false);
					lastFrameRef.current = null; // allow live frames again
					onToggle(false);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
	}, [countdownSeconds, enableCountdown, onToggle]);

	// Toggle pause or cancel countdown
	const pause = useCallback((canvasRef, ctxRef, predicateArg) => {
		if (!allowPause(predicateArg)) return; // block based on external condition

		// If currently counting down -> cancel and restore full pause
		if (isResuming) {
			clearCountdown();
			isPausedRef.current = true;
			setIsPaused(true);
			captureFrame(canvasRef, ctxRef); // ensure we have a frozen frame
			onToggle(true);
			return;
		}

		// Flip pause state
		isPausedRef.current = !isPausedRef.current;
		setIsPaused(isPausedRef.current);
		onToggle(isPausedRef.current);

		if (isPausedRef.current) {
			// Entering pause: capture current frame
			captureFrame(canvasRef, ctxRef);
		} else {
			// Leaving pause: start countdown instead of instant resume
			startCountdown();
		}
	}, [allowPause, isResuming, clearCountdown, captureFrame, startCountdown, onToggle]);

	const resume = useCallback((canvasRef, ctxRef, predicateArg) => {
		if (!allowPause(predicateArg)) return;
		if (!isPausedRef.current) return; // already running
		if (isResuming) return; // countdown already active
		// Transition from paused to countdown
		isPausedRef.current = false;
		setIsPaused(false);
		startCountdown();
	}, [allowPause, isResuming, startCountdown]);

	// Cleanup interval on unmount
	useEffect(() => () => clearCountdown(), [clearCountdown]);

	return {
		isPaused,
		isResuming,
		resumeCountdown,
		pause,
		resume,
		isPausedRef,
		lastFrameRef
	};
}

