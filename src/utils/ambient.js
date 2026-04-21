let ctx = null;
let currentNodes = [];

function getCtx() {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (err) {
      console.warn("AudioContext init failed", err);
    }
  }
  return ctx;
}

export function stopAmbient() {
  currentNodes.forEach(node => {
    try { node.disconnect(); } catch(_e) {}
  });
  currentNodes = [];
}

function createNoiseBuffer(type = 'pink') {
  const context = getCtx();
  const bufferSize = 2 * context.sampleRate;
  const noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
  const output = noiseBuffer.getChannelData(0);

  let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0;
  for (let i = 0; i < bufferSize; i++) {
    let white = Math.random() * 2 - 1;
    if (type === 'pink') {
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11; // gain compensation
      b6 = white * 0.115926;
    } else if (type === 'brown') {
      b0 = (b0 + (0.02 * white)) / 1.02;
      output[i] = b0 * 3.5;
    } else {
      output[i] = white * 0.5; // white noise
    }
  }
  return noiseBuffer;
}

export function playAmbient(type) {
  stopAmbient();
  if (type === 'none') return;

  const context = getCtx();
  if (context.state === 'suspended') context.resume();

  const source = context.createBufferSource();
  source.buffer = createNoiseBuffer(type === 'rain' ? 'pink' : type === 'waves' ? 'pink' : 'brown');
  source.loop = true;

  if (type === 'rain') {
    // Rain: Pink noise with a lowpass filter
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1200;
    
    // Add a slight high freq boost to simulate drops
    const peakFilter = context.createBiquadFilter();
    peakFilter.type = 'peaking';
    peakFilter.frequency.value = 4000;
    peakFilter.Q.value = 1;
    peakFilter.gain.value = 5;

    const gainNode = context.createGain();
    gainNode.gain.value = 0.5;

    source.connect(filter);
    filter.connect(peakFilter);
    peakFilter.connect(gainNode);
    gainNode.connect(context.destination);

    source.start(0);
    currentNodes.push(source, filter, peakFilter, gainNode);
  } else if (type === 'waves') {
    // Ocean Waves: Pink noise with rhythmic LFO on the filter and gain
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400; // base freq

    const lfo = context.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.15; // slow wave (~6.6s cycle)

    const lfoGain = context.createGain();
    lfoGain.gain.value = 400; // sweep filter freq by +/- 400Hz

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const gainNode = context.createGain();
    gainNode.gain.value = 0.2;

    const amplitudeLfo = context.createOscillator();
    amplitudeLfo.type = 'sine';
    amplitudeLfo.frequency.value = 0.15;
    
    const amplitudeLfoGain = context.createGain();
    amplitudeLfoGain.gain.value = 0.15; // sweep volume
    amplitudeLfo.connect(amplitudeLfoGain);
    amplitudeLfoGain.connect(gainNode.gain);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(context.destination);

    source.start(0);
    lfo.start(0);
    amplitudeLfo.start(0);
    currentNodes.push(source, filter, lfo, lfoGain, amplitudeLfo, amplitudeLfoGain, gainNode);
  } else if (type === 'focus') {
    // Deep Focus Labs (Binaural Beats): Two sine waves slightly detuned + soft brown noise
    const osc1 = context.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 200; // Left ear
    
    const osc2 = context.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 205; // Right ear (5Hz Theta Beat for focus)

    const panner1 = context.createStereoPanner();
    panner1.pan.value = -1;
    const panner2 = context.createStereoPanner();
    panner2.pan.value = 1;

    const oscGain = context.createGain();
    oscGain.gain.value = 0.3;

    osc1.connect(panner1);
    panner1.connect(oscGain);
    osc2.connect(panner2);
    panner2.connect(oscGain);
    oscGain.connect(context.destination);

    // Add very low volume brown noise for background texture
    const noiseGain = context.createGain();
    noiseGain.gain.value = 0.05;
    const lowpass = context.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 400;

    source.connect(lowpass);
    lowpass.connect(noiseGain);
    noiseGain.connect(context.destination);

    source.start(0);
    osc1.start(0);
    osc2.start(0);
    currentNodes.push(source, osc1, osc2, panner1, panner2, oscGain, noiseGain, lowpass);
  }
}
