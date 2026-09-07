#!/usr/bin/env python3
"""Original procedural soundtrack. Code MIT; composition and recording CC0.

No samples, downloads, third-party melodies, or pretrained models are used.
Requires Python 3 and NumPy. Run from any directory; output is project-relative.
96 BPM hip-hop, six 4/4 bars, D minor, 2.5–17.5 seconds in a 20-second film.
"""
from pathlib import Path
import json
import wave
import numpy as np

SR = 48000
DURATION = 20.0
BPM = 96
BEAT = 60 / BPM
START = 2.5
CUTS = [3.75, 6.25, 8.75, 13.75, 17.5]
rng = np.random.default_rng(190824)
mix = np.zeros((int(SR * DURATION), 2), dtype=np.float64)
music = np.zeros_like(mix)


def timeline(duration):
    return np.arange(int(duration * SR)) / SR


def filtered_noise(duration, low, high):
    n = int(duration * SR)
    white = rng.standard_normal(n)
    freq = np.fft.rfftfreq(n, 1 / SR)
    shape = (1 - np.exp(-(freq / max(low, 1)) ** 4)) * np.exp(-(freq / high) ** 4)
    sound = np.fft.irfft(np.fft.rfft(white) * shape, n=n)
    return sound / max(np.std(sound), 1e-8)


def add(bus, sound, when, gain=1, pan=0):
    first = int(round(when * SR))
    if first < 0:
        sound = sound[-first:]
        first = 0
    count = min(len(sound), len(bus) - first)
    if count <= 0:
        return
    if sound.ndim == 1:
        p = (pan + 1) * np.pi / 4
        sound = sound[:, None] * np.array([np.cos(p), np.sin(p)])
    bus[first:first + count] += sound[:count] * gain


def note_frequency(midi):
    return 440 * 2 ** ((midi - 69) / 12)


def kick():
    t = timeline(.45)
    freq = 47 + 118 * np.exp(-t * 48)
    body = np.sin(2 * np.pi * np.cumsum(freq) / SR)
    body *= (1 - np.exp(-t * 1700)) * np.exp(-t * 12)
    click = filtered_noise(.45, 1500, 6200) * np.exp(-t * 330) * .11
    return np.tanh((body + click) * 1.7) / 1.7


def hat(opened=False):
    duration = .23 if opened else .075
    t = timeline(duration)
    return filtered_noise(duration, 6500, 15500) * np.exp(-t * (23 if opened else 85)) * np.minimum(t * 3500, 1)


def clap():
    t = timeline(.25)
    envelope = sum(np.where(t >= p, np.exp(-np.maximum(t - p, 0) * 180), 0) for p in [0, .012, .027])
    envelope += np.where(t >= .035, np.exp(-np.maximum(t - .035, 0) * 30), 0) * .35
    return filtered_noise(.25, 1100, 8800) * envelope * .45


def bass(midi, duration):
    t = timeline(duration + .12)
    f = note_frequency(midi)
    tone = np.sin(2 * np.pi * f * t)
    for harmonic in [2, 3, 4, 5]:
        tone += np.sin(2 * np.pi * f * harmonic * t) / harmonic * .26 * np.exp(-t * 9)
    env = (1 - np.exp(-t * 200)) * np.minimum(np.maximum(duration + .08 - t, 0) / .11, 1)
    return np.tanh(tone * 1.4) * env


def pluck(midi, strength=1):
    t = timeline(.95)
    f = note_frequency(midi)
    tone = np.zeros_like(t)
    # Decaying partials and gentle detuning create a struck-string character.
    for h in range(1, 8):
        amp = np.exp(-t * (4 + h * 2.1)) / h ** 1.65
        tone += np.sin(2 * np.pi * f * h * t + .2 * h) * amp
        tone += .22 * np.sin(2 * np.pi * f * 1.0018 * h * t) * amp
    return tone * (1 - np.exp(-t * 1400)) * strength


def pad(notes, duration):
    t = timeline(duration)
    stereo = np.zeros((len(t), 2))
    for index, midi in enumerate(notes):
        f = note_frequency(midi)
        for channel, detune in enumerate([.9984, 1.0016]):
            stereo[:, channel] += np.sin(2 * np.pi * f * detune * t + index * .7)
            stereo[:, channel] += .14 * np.sin(2 * np.pi * f * 2 * detune * t)
    env = np.minimum(t / .35, 1) * np.minimum(np.maximum(duration - t, 0) / .6, 1)
    return stereo * env[:, None] / len(notes)


# Intro: restrained harmonic shimmer and a soft upward breath into the groove.
add(mix, pad([50, 57, 64, 69], 3.4), 0, .065)
intro_t = timeline(1.25)
add(mix, filtered_noise(1.25, 1800, 6500) * np.sin(np.pi * intro_t / 1.25) ** 2, 1.25, .028)

# Original hip-hop groove: swung hats, syncopated kick, backbeat snare,
# sustained 808-style bass and sparse minor-ninth keys. Six bars = 15 seconds.
chords = [[50, 57, 60, 64], [46, 53, 57, 60], [48, 55, 58, 62]]
roots = [38, 34, 36]
motifs = [[74, 69, 72], [69, 65, 72], [70, 67, 74]]
kick_times = []
for bar in range(6):
    start = START + bar * 4 * BEAT
    ci = bar % 3
    add(music, pad(chords[ci], 4 * BEAT + .2), start, .065)
    for off in ([0, .75, 2, 2.75] if bar % 2 == 0 else [0, 1.75, 2.5, 3.5]):
        when = start + off * BEAT
        kick_times.append(when)
        add(mix, kick(), when, .90)
    for off in [1, 3]:
        when = start + off * BEAT + .009
        add(mix, clap(), when, .32)
        st = timeline(.18)
        snap = np.sin(2*np.pi*185*st) * np.exp(-st*25) * np.minimum(st*2500, 1)
        add(mix, snap, when, .22)
    for eighth in range(8):
        swing = .065 if eighth % 2 else 0
        add(mix, hat(), start + (eighth / 2 + swing) * BEAT,
            .053 if eighth % 2 == 0 else .036, -.22 if eighth % 2 else .18)
    add(mix, hat(True), start + 2.56 * BEAT, .035, .25)
    if bar in [1, 3, 5]:
        for off in [3.5, 3.667, 3.833]:
            add(mix, hat(), start + off * BEAT, .032, -.3)
    for off, length, octave in [(0, 1.35, 0), (1.75, .6, 0), (2.5, 1.1, 0), (3.75, .23, 12)]:
        sound = bass(roots[ci] + octave, length * BEAT)
        add(music, sound, start + off * BEAT, .35)
    for off, midi in zip([.5, 1.75, 3.25], motifs[ci]):
        sound = pluck(midi - 12)
        moment = start + off * BEAT
        add(music, sound, moment, .16, -.15)
        add(music, sound, moment + BEAT * .75, .045, .25)

# Duck the sustained bass/keys only on actual syncopated kick hits.
t = timeline(DURATION)
duck = np.ones_like(t)
for moment in kick_times:
    elapsed = t - moment
    duck *= 1 - .48 * np.where(elapsed >= 0, np.exp(-np.maximum(elapsed, 0) / .065), 0)
musical_tail = np.ones_like(t)
musical_tail[t >= 17.5] = np.exp(-(t[t >= 17.5] - 17.5) * 3.8)
mix += music * (duck * musical_tail)[:, None]

# Air transitions resolve exactly onto the film cut grid, with stereo movement.
for index, cut in enumerate(CUTS):
    duration = .46 if index < 4 else .8
    wt = timeline(duration)
    noise = filtered_noise(duration, 1200, 7800)
    env = np.sin(np.pi * wt / duration) ** 2 * (.4 + wt / duration)
    whoosh = noise * env
    add(mix, whoosh, cut - duration * .76, .031 if index < 4 else .04, -.35)
    add(mix, whoosh, cut - duration * .76 + .013, .025 if index < 4 else .032, .35)

# Tonal logo landing, with a low impact and warm consonant decay.
add(mix, pad([38, 50, 57, 62, 65], 2.45), 17.5, .15)
impact_t = timeline(1.4)
impact_f = 38 + 65 * np.exp(-impact_t * 14)
impact = np.sin(2 * np.pi * np.cumsum(impact_f) / SR) * np.exp(-impact_t * 5)
impact *= np.minimum(impact_t * 300, 1)
add(mix, impact, 18.5, .25)
add(mix, pluck(74), 17.5, .065, -.15)

# Short stereo room reflections. No modulation of the kick/sub to preserve focus.
for channel in [0, 1]:
    source = mix[:, channel].copy()
    for delay, gain in [(0.031 + channel * .006, .075), (.071 - channel * .009, .045)]:
        samples = int(delay * SR)
        mix[samples:, channel] += source[:-samples] * gain

# DC removal, gentle analog-style saturation, and a guaranteed silent tail.
mix -= np.mean(mix, axis=0)
mix = np.tanh(mix * 1.16) / 1.16
fade = np.minimum(t / .03, 1) * np.minimum(np.maximum(DURATION - t, 0) / .8, 1)
mix *= fade[:, None]
mix[-1] = 0
target = 10 ** (-.8 / 20)
mix *= target / np.max(np.abs(mix))
pcm = np.round(mix * 32767).astype('<i2')
output = Path(__file__).resolve().parents[1] / 'artifacts' / 'macbook-hiphop-score.wav'
output.parent.mkdir(exist_ok=True)
with wave.open(str(output), 'wb') as wav:
    wav.setnchannels(2)
    wav.setsampwidth(2)
    wav.setframerate(SR)
    wav.writeframes(pcm.tobytes())
with wave.open(str(output), 'rb') as wav:
    assert wav.getnframes() == 960000
    assert wav.getnchannels() == 2 and wav.getframerate() == 48000
peak = float(np.max(np.abs(pcm.astype(float)))) / 32768
rms = float(np.sqrt(np.mean((pcm.astype(float) / 32768) ** 2)))
assert np.max(np.abs(pcm.astype(float))) < 32767
assert np.all(pcm[-1] == 0)
print(json.dumps({'output': str(output), 'duration_seconds': DURATION, 'sample_rate': SR,
                  'channels': 2, 'peak_dbfs': round(20 * np.log10(peak), 3),
                  'rms_dbfs': round(20 * np.log10(rms), 3), 'bpm': BPM,
                  'music_start': START, 'music_end': 17.5, 'cut_times': CUTS}, indent=2))
