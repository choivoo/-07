"""녹화 프레임 + 효과음 wav + BGM 을 합쳐 mp4 로 만든다.  python3 tools/promo/mix.py <녹화폴더> <출력폴더>"""
import json, subprocess, sys, os
SRC = sys.argv[1] if len(sys.argv) > 1 else '/tmp/promo'
DST = sys.argv[2] if len(sys.argv) > 2 else '/home/user/-07/promo'
AUD = '/home/user/-07/assets/audio/'
os.makedirs(DST, exist_ok=True)
frames = json.load(open(SRC + '/frames.json')); M = json.load(open(SRC + '/markers.json'))
t0 = M['t0']; end = M['end'] + 0.9; T = lambda k: M[k] - t0; DUR = end - t0
# ---- 영상: 가변 프레임 -> 30fps ----
keep = [f for f in frames if f[1] >= t0 - 0.02]
prev = [f for f in frames if f[1] < t0 - 0.02]
if prev: keep.insert(0, [prev[-1][0], t0])
with open(SRC + '/list.txt', 'w') as fh:
    for i, (fn, ts) in enumerate(keep):
        nxt = keep[i + 1][1] if i + 1 < len(keep) else end
        fh.write(f"file '{fn}'\nduration {max(0.001, min(nxt - ts, 1.5)):.4f}\n")
    fh.write(f"file '{keep[-1][0]}'\n")
vid = SRC + '/video_raw.mp4'
subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', SRC + '/list.txt', '-vf', f'fps=30,scale=1080:1920,format=yuv420p,fade=t=in:st=0:d=0.5,fade=t=out:st={DUR-0.9:.2f}:d=0.9', '-t', f'{DUR:.2f}', '-c:v', 'libx264', '-preset', 'medium', '-crf', '24', '-maxrate', '6M', '-bufsize', '12M', '-r', '30', vid])
print('video ok')
# ---- 오디오 ----
tM, tB, tX, tR, tC, tMo, tO = T('match'), T('battle'), T('double'), T('result'), T('chest'), T('montage'), T('outro')
segs = [  # file, offset, start, length, fadeIn, fadeOut, volume
    ('bgm_menu.mp3', 0, 0, tM + 1.5, 0.6, 1.5, 0.55),
    ('bgm_battle.mp3', 0, tM, tX - tM + 1.5, 1.5, 1.5, 0.55),
    ('bgm_battle_x2.mp3', 0, tX, tR - tX + 0.2, 1.2, 0.5, 0.55),
    ('bgm_win.mp3', 0, tR - 1.4, 14, 0.05, 2.5, 0.8),
    ('bgm_menu.mp3', 70, tR + 7.5, tMo - tR - 6.0, 2.0, 1.2, 0.55),
    ('bgm_overtime.mp3', 12, tMo - 0.3, tO - tMo + 1.0, 0.8, 0.8, 0.55),
    ('bgm_win.mp3', 0, tO, DUR - tO, 0.05, 1.2, 0.8),
]
inputs = ['-i', SRC + '/sfx.wav']; flt = [f"[0:a]atrim=0:{DUR:.2f},asetpts=PTS-STARTPTS,volume=0.95[a0]"]; labels = ['[a0]']
for i, (f, off, st, ln, fi, fo, v) in enumerate(segs, 1):
    inputs += ['-i', AUD + f]; ln = max(1.0, ln); ms = int(max(0, st) * 1000)
    flt.append(f"[{i}:a]atrim=start={off}:duration={ln:.2f},asetpts=PTS-STARTPTS,afade=t=in:d={fi},afade=t=out:st={max(0, ln - fo):.2f}:d={fo},volume={v},adelay={ms}|{ms}[a{i}]"); labels.append(f'[a{i}]')
flt.append(''.join(labels) + f"amix=inputs={len(labels)}:normalize=0:duration=longest,atrim=0:{DUR:.2f},afade=t=out:st={DUR-1.2:.2f}:d=1.2,loudnorm=I=-14:TP=-1.5:LRA=9[out]")
aud = SRC + '/audio.m4a'
subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error'] + inputs + ['-filter_complex', ';'.join(flt), '-map', '[out]', '-c:a', 'aac', '-b:a', '192k', aud])
print('audio ok')
final = DST + '/clash_arena_promo.mp4'
subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', '-i', vid, '-i', aud, '-c:v', 'copy', '-c:a', 'copy', '-movflags', '+faststart', '-shortest', final])
small = DST + '/clash_arena_promo_720p.mp4'
subprocess.check_call(['ffmpeg', '-y', '-loglevel', 'error', '-i', final, '-vf', 'scale=720:1280', '-c:v', 'libx264', '-preset', 'medium', '-crf', '25', '-maxrate', '3M', '-bufsize', '6M', '-c:a', 'copy', '-movflags', '+faststart', small])
for f in (final, small):
    d = subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration,size', '-of', 'csv=p=0', f]).decode().strip()
    print(os.path.basename(f), d)
