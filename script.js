/**
 * Royal Muslim Wedding Invitation — Interactive Script
 * Features: 3D Video Envelope Reveal, Vocal Nasheed Audio,
 * Scratch-to-reveal Date, Countdown Timer, Gold Dust Particles & Smooth Scroll.
 */

document.addEventListener('DOMContentLoaded', () => {

    // Ensure page strictly loads and remains at top (0,0) during opening animation
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    document.body.classList.add('opening-active');

    // =========================================================================
    // 1. Ultra-Smooth Lenis Scroll Configuration (Initialized stopped during opening)
    // =========================================================================
    let lenis;
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 0.9,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            smoothTouch: false, // native momentum on mobile for 120Hz buttery smoothness
            wheelMultiplier: 0.95,
            touchMultiplier: 1.5,
        });

        // Stop Lenis while envelope animation plays so user cannot scroll away
        lenis.stop();

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    }

    // =========================================================================
    // 2. Audio / Nasheed Player Logic
    // =========================================================================
    const bgMusic = document.getElementById('bg-music');
    const musicBtn = document.getElementById('floating-music-btn');
    const musicContainer = document.getElementById('floating-music-container') || document.querySelector('.floating-music-btn-container');
    const tapPrompt = document.getElementById('tap-to-open-prompt');
    const tapBtn = document.getElementById('tap-to-open-btn');
    let isMusicPlaying = false;
    let userManuallyMuted = false;

    function updateMusicUI(playing) {
        if (!musicBtn) return;
        const tooltip = musicBtn.querySelector('.music-tooltip');
        if (playing) {
            musicBtn.classList.add('playing');
            musicBtn.classList.remove('muted');
            musicBtn.setAttribute('title', 'Click to Mute Sound');
            musicBtn.setAttribute('aria-label', 'Mute Sound');
            if (tooltip) tooltip.textContent = 'Mute';
            if (tapPrompt) {
                tapPrompt.classList.add('hidden');
            }
            if (musicContainer) {
                musicContainer.classList.add('visible');
            }
        } else {
            musicBtn.classList.remove('playing');
            musicBtn.classList.add('muted');
            musicBtn.setAttribute('title', 'Click to Play Sound');
            musicBtn.setAttribute('aria-label', 'Play Sound');
            if (tooltip) tooltip.textContent = 'Unmute';
        }
    }

    function playNasheed(fromBeginning = false) {
        if (!bgMusic || userManuallyMuted) return Promise.reject(new Error("Muted or no audio"));
        if (fromBeginning) {
            try {
                bgMusic.currentTime = 0;
            } catch (e) {}
        }
        bgMusic.volume = 0.55;
        const promise = bgMusic.play();
        if (promise !== undefined) {
            return promise.then(() => {
                isMusicPlaying = true;
                updateMusicUI(true);
                return true;
            }).catch((err) => {
                isMusicPlaying = false;
                updateMusicUI(false);
                throw err;
            });
        }
        return Promise.resolve(true);
    }

    function pauseNasheed() {
        if (!bgMusic) return;
        bgMusic.pause();
        isMusicPlaying = false;
        updateMusicUI(false);
    }

    if (musicBtn && bgMusic) {
        musicBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isMusicPlaying) {
                userManuallyMuted = true;
                pauseNasheed();
            } else {
                userManuallyMuted = false;
                playNasheed(false);
            }
        });
    }

    // =========================================================================
    // 3. Interactive 3D Video Envelope Opening (Auto-play on load + smooth reveal)
    // =========================================================================
    const envelopeScreen = document.getElementById('envelope-screen');
    const envelopeVideo = document.getElementById('envelope-video');
    const invitationContent = document.getElementById('invitation-content');
    const replayEnvelopeBtn = document.getElementById('replay-envelope-btn');
    let isEnvelopeOpening = false;
    let openingFinished = false;

    function finishOpening() {
        if (openingFinished) return;
        openingFinished = true;
        if (!envelopeScreen) return;
        envelopeScreen.classList.add('opened');

        if (musicContainer) {
            musicContainer.classList.add('visible');
        }

        // Guarantee view is strictly at the top of the card
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

        if (invitationContent) {
            invitationContent.classList.add('visible');
        }

        setTimeout(() => {
            envelopeScreen.style.display = 'none';
            document.body.classList.remove('opening-active');
            if (envelopeVideo) {
                envelopeVideo.pause();
            }
            window.scrollTo(0, 0);
            if (!isMusicPlaying && !userManuallyMuted) {
                playNasheed(false).catch(() => {});
            }
            if (lenis) {
                lenis.resize();
                lenis.start();
                lenis.scrollTo(0, { immediate: true });
            }
        }, 750);
    }

    // Attach listeners unconditionally to the video element
    if (envelopeVideo) {
        envelopeVideo.muted = true;
        envelopeVideo.defaultMuted = true;
        envelopeVideo.playsInline = true;
        envelopeVideo.setAttribute('muted', '');
        envelopeVideo.setAttribute('playsinline', '');
        envelopeVideo.setAttribute('webkit-playsinline', '');

        // When video reaches 7.8 seconds (card is fully zoomed and visible), transition smoothly
        envelopeVideo.addEventListener('timeupdate', () => {
            if (envelopeVideo.currentTime >= 7.8) {
                finishOpening();
            }
        });

        // When video reaches its end, transition smoothly
        envelopeVideo.addEventListener('ended', finishOpening, { once: true });

        // Once video actually starts playing on mobile, allow it to complete its full animation
        envelopeVideo.addEventListener('playing', () => {
            setTimeout(() => {
                if (!openingFinished) finishOpening();
            }, 8300);
        });
    }

    // Synchronized Experience Launcher: Ensures music and video play together from the beginning
    function startExperience(userGesture = false) {
        if (openingFinished) return;

        if (userGesture) {
            // DIRECT USER GESTURE (Tap / Click):
            // Safari/iOS requires synchronous play() calls inside the user gesture event handler
            if (tapPrompt) tapPrompt.classList.add('hidden');

            // 1. Synchronously trigger envelope opening video
            if (envelopeVideo) {
                envelopeVideo.muted = true;
                envelopeVideo.defaultMuted = true;
                envelopeVideo.playsInline = true;
                try {
                    envelopeVideo.currentTime = 0;
                } catch (e) {}
                const vPromise = envelopeVideo.play();
                if (vPromise !== undefined) {
                    vPromise.then(() => {
                        isEnvelopeOpening = true;
                    }).catch((err) => {
                        console.warn("Video playback deferred/prevented:", err);
                    });
                } else {
                    isEnvelopeOpening = true;
                }
            }

            // 2. Synchronously trigger background audio from the very start
            if (bgMusic && !userManuallyMuted) {
                try {
                    bgMusic.currentTime = 0;
                } catch (e) {}
                bgMusic.volume = 0.55;
                const aPromise = bgMusic.play();
                if (aPromise !== undefined) {
                    aPromise.then(() => {
                        isMusicPlaying = true;
                        updateMusicUI(true);
                    }).catch((err) => {
                        console.warn("Audio playback prevented:", err);
                    });
                }
            }

            // Emergency safety timer: Only if video completely fails to play after 10s
            setTimeout(() => {
                if (!openingFinished) finishOpening();
            }, 10000);

        } else {
            // INITIAL PAGE LOAD (Before user interaction):
            // Test if the browser allows unmuted audio autoplay
            if (bgMusic && !userManuallyMuted) {
                bgMusic.volume = 0.55;
                const testAudio = bgMusic.play();
                if (testAudio !== undefined) {
                    testAudio.then(() => {
                        // Desktop/browser with autoplay allowed: start both seamlessly
                        isMusicPlaying = true;
                        updateMusicUI(true);
                        if (tapPrompt) tapPrompt.classList.add('hidden');
                        if (envelopeVideo) {
                            envelopeVideo.muted = true;
                            envelopeVideo.play().catch(() => {});
                        }
                        setTimeout(() => {
                            if (!openingFinished) finishOpening();
                        }, 8300);
                    }).catch(() => {
                        // Mobile browser requires user interaction for sound:
                        // Keep envelope paused at pristine frame 0 so video and sound start together on tap!
                        isMusicPlaying = false;
                        updateMusicUI(false);
                        if (envelopeVideo) {
                            try {
                                envelopeVideo.pause();
                                envelopeVideo.currentTime = 0;
                            } catch (e) {}
                        }
                        if (tapPrompt) tapPrompt.classList.remove('hidden');
                    });
                }
            }
        }
    }

    // 1. Try launching immediately
    startExperience(false);

    // 2. Try on DOM load & Window load
    document.addEventListener('DOMContentLoaded', () => startExperience(false));
    window.addEventListener('load', () => startExperience(false));

    // Tap to Open Invitation Button & Screen
    if (tapBtn) {
        tapBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userManuallyMuted = false;
            startExperience(true);
        });
        tapBtn.addEventListener('touchend', (e) => {
            e.stopPropagation();
            userManuallyMuted = false;
            startExperience(true);
        }, { passive: true });
    }

    if (envelopeScreen) {
        envelopeScreen.addEventListener('click', (e) => {
            userManuallyMuted = false;
            startExperience(true);
        });
        envelopeScreen.addEventListener('touchend', (e) => {
            userManuallyMuted = false;
            startExperience(true);
        }, { passive: true });
    }

    // Global listener: On first user interaction anywhere, ensure audio and experience start
    const onFirstUserInteraction = (e) => {
        if (userManuallyMuted) return;
        if (e && e.target && e.target.closest('#floating-music-btn')) return;
        startExperience(true);
        ['click', 'touchstart', 'scroll', 'pointerdown', 'keydown'].forEach(evt => {
            window.removeEventListener(evt, onFirstUserInteraction, { capture: true });
        });
    };
    ['click', 'touchstart', 'scroll', 'pointerdown', 'keydown'].forEach(evt => {
        window.addEventListener(evt, onFirstUserInteraction, { capture: true, passive: true });
    });

    // Replay Video Envelope — Replay animation and restart nasheed from the start
    if (replayEnvelopeBtn) {
        replayEnvelopeBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'instant' });
            document.body.classList.add('opening-active');
            isEnvelopeOpening = false;
            openingFinished = false;
            userManuallyMuted = false;
            if (envelopeScreen) {
                envelopeScreen.style.display = 'flex';
                envelopeScreen.classList.remove('opened');
            }
            if (envelopeVideo) {
                envelopeVideo.currentTime = 0;
            }
            startExperience(true);
        });
    }

    // =========================================================================
    // 4. Countdown Timer Logic (December 6, 2026 at 11:00 AM)
    // =========================================================================
    const targetDate = new Date("December 6, 2026 11:00:00").getTime();
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    function updateCountdown() {
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference < 0) {
            if (daysEl) daysEl.innerText = "00";
            if (hoursEl) hoursEl.innerText = "00";
            if (minutesEl) minutesEl.innerText = "00";
            if (secondsEl) secondsEl.innerText = "00";
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        if (daysEl) daysEl.innerText = String(days).padStart(2, '0');
        if (hoursEl) hoursEl.innerText = String(hours).padStart(2, '0');
        if (minutesEl) minutesEl.innerText = String(minutes).padStart(2, '0');
        if (secondsEl) secondsEl.innerText = String(seconds).padStart(2, '0');
    }

    setInterval(updateCountdown, 1000);
    updateCountdown();

    // =========================================================================
    // 5. Intersection Observer for Scroll Animations
    // =========================================================================
    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.fade-in-on-scroll').forEach(el => scrollObserver.observe(el));

    // =========================================================================
    // 6. Interactive Scratch-to-Reveal Card
    // =========================================================================
    const scratchCanvas = document.getElementById('scratch-canvas');
    const autoRevealBtn = document.getElementById('auto-reveal-btn');

    if (scratchCanvas) {
        const ctx = scratchCanvas.getContext('2d');
        const wrapper = scratchCanvas.parentElement;
        let isDrawing = false;
        let isRevealed = false;

        function resizeCanvas() {
            scratchCanvas.width = wrapper.offsetWidth;
            scratchCanvas.height = wrapper.offsetHeight;
            drawScratchCover();
        }

        function drawScratchCover() {
            const w = scratchCanvas.width;
            const h = scratchCanvas.height;

            // Metallic Brushed Gold Gradient
            const grad = ctx.createLinearGradient(0, 0, w, h);
            grad.addColorStop(0, '#D2C08A');
            grad.addColorStop(0.35, '#f3e9cf');
            grad.addColorStop(0.65, '#9E824A');
            grad.addColorStop(1, '#D2C08A');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);

            // Shimmering pattern overlay
            ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
            for (let i = 0; i < 40; i++) {
                ctx.beginPath();
                ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 2, 0, Math.PI * 2);
                ctx.fill();
            }

            // Elegant instruction text on scratch surface
            ctx.fillStyle = '#3a2c18';
            ctx.font = '600 13px "Montserrat", sans-serif';
            ctx.textAlign = 'center';
            ctx.letterSpacing = '2px';
            ctx.fillText('✦ SCRATCH TO REVEAL DATE ✦', w / 2, h / 2 - 8);

            ctx.fillStyle = '#6e5e47';
            ctx.font = '500 11px "Montserrat", sans-serif';
            ctx.fillText('Touch & drag across the gold surface', w / 2, h / 2 + 16);
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        function scratch(x, y) {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(x, y, 28, 0, Math.PI * 2);
            ctx.fill();
            checkScratchPercent();
        }

        function checkScratchPercent() {
            if (isRevealed) return;
            const pixels = ctx.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height).data;
            let clearCount = 0;
            const total = pixels.length / 4;
            for (let i = 3; i < pixels.length; i += 16) {
                if (pixels[i] === 0) clearCount += 4;
            }
            if (clearCount / total > 0.4) {
                revealCompletely();
            }
        }

        function revealCompletely() {
            isRevealed = true;
            scratchCanvas.style.opacity = '0';
            setTimeout(() => {
                scratchCanvas.style.display = 'none';
            }, 600);
        }

        function getPos(e) {
            const rect = scratchCanvas.getBoundingClientRect();
            if (e.touches && e.touches[0]) {
                return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
            }
            return { x: e.clientX - rect.left, y: e.clientY - rect.top };
        }

        scratchCanvas.addEventListener('mousedown', (e) => { isDrawing = true; const p = getPos(e); scratch(p.x, p.y); });
        scratchCanvas.addEventListener('mousemove', (e) => { if (isDrawing) { const p = getPos(e); scratch(p.x, p.y); } });
        window.addEventListener('mouseup', () => { isDrawing = false; });

        scratchCanvas.addEventListener('touchstart', (e) => { isDrawing = true; const p = getPos(e); scratch(p.x, p.y); }, { passive: true });
        scratchCanvas.addEventListener('touchmove', (e) => { if (isDrawing) { const p = getPos(e); scratch(p.x, p.y); } }, { passive: true });
        window.addEventListener('touchend', () => { isDrawing = false; });

        if (autoRevealBtn) {
            autoRevealBtn.addEventListener('click', revealCompletely);
        }
    }

    // =========================================================================
    // 7. Golden Sparkle & Ambient Dust Particles
    // =========================================================================
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });

        const particles = [];
        const count = Math.min(22, Math.floor(window.innerWidth / 45));

        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 2 + 0.8,
                dy: -(Math.random() * 0.45 + 0.15),
                dx: (Math.random() - 0.5) * 0.3,
                opacity: Math.random() * 0.5 + 0.2,
                color: Math.random() > 0.3 ? '#D2C08A' : '#ffffff'
            });
        }

        function renderParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.y += p.dy;
                p.x += p.dx;
                if (p.y < -10) p.y = canvas.height + 10;
                if (p.x < -10) p.x = canvas.width + 10;
                if (p.x > canvas.width + 10) p.x = -10;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.opacity;
                ctx.fill();
            });
            requestAnimationFrame(renderParticles);
        }
        renderParticles();
    }

    // =========================================================================
    // 8. Share Invitation
    // =========================================================================
    const shareBtn = document.getElementById('share-invite-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            const shareData = {
                title: 'Save the Date | Fathima Shamila & Muhammed Dilshad',
                text: 'With the blessings of Almighty Allah & our families, you are cordially invited to celebrate the wedding ceremony of Fathima Shamila & Muhammed Dilshad on Sunday, December 6, 2026 at Papilio Wonderland, Padaparamba. Nikah at 11:00 AM. Kindly grace this occasion with your presence and duas.',
                url: window.location.href
            };

            if (navigator.share) {
                try {
                    await navigator.share(shareData);
                } catch (err) {}
            } else {
                navigator.clipboard.writeText(window.location.href);
                const originalText = shareBtn.querySelector('span').textContent;
                shareBtn.querySelector('span').textContent = 'Link Copied!';
                setTimeout(() => {
                    shareBtn.querySelector('span').textContent = originalText;
                }, 2500);
            }
        });
    }

});
