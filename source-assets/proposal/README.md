# Proposal still — lighting restoration

The user requested a brighter, improved/upscaled proposal photograph and allowed a better frame from the source video. The chapter remains photo-only.

- Source: the user-identified `IMG_1326.MOV`, at **235 seconds**. Sidharth is kneeling before Kalyani, who is seated and smiling.
- Edit input: [proposal-235-edit-input.jpg](proposal-235-edit-input.jpg), the existing 640 × 822 crop from the earlier proposal video review. The video's display orientation and HLG-to-SDR tone mapping were applied during extraction. A fresh native-resolution extraction was also inspected locally.
- Selected output: [proposal-restored-v2.png](proposal-restored-v2.png), **1106 × 1422**, made with the built-in **image_gen** tool. [Exact prompt](prompt.txt) and [hashes](provenance.json) are retained.
- Edit: restrained exposure/shadow lift, warmer natural colour and a higher-resolution output. Original facial softness is retained more closely than in the rejected first trial. This is AI-assisted restoration, not recovered documentary detail or a pixel-identical colour grade.
- Rejected first trial: overly reconstructed faces and scenery. It is not used by the page.
- Web derivatives: `invite/assets/photos/proposal-restored-v2-{480,960}.webp`, optimized for the compact frame on desktop and phone.
- Display: upright inside the existing arched frame, with a 1.5× CSS crop focused at 65%/10%. Both people and the kneeling gesture remain visible. No proposal video or audio is served.

Rebuild with `scripts/build-invite-assets.py --wiki /path/to/private/wedding/wiki --only proposal-restored-v2`. The builder reads this preserved selected output, so later builds do not revert to the old dim photograph. Both original user sources remain untouched.
