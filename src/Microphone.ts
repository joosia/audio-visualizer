export class Microphone {
   private initialized: boolean = false;
   private audioContext!: AudioContext;
   private microphone!: MediaStreamAudioSourceNode;
   private analyzer!: AnalyserNode;
   private dataArray!: Uint8Array;

   constructor() {
      this.initMicrophone().catch(err => {
         console.error('Microphone initialization failed:', err);
         alert('Could not access microphone: ' + err.message);
      });
   }

   private async initMicrophone(): Promise<void> {
      try {
         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
         this.audioContext = new AudioContext();
         this.microphone = this.audioContext.createMediaStreamSource(stream);
         this.analyzer = this.audioContext.createAnalyser();
         this.analyzer.fftSize = 256;
         this.analyzer.smoothingTimeConstant = 0.6;
         const bufferLength = this.analyzer.frequencyBinCount;
         this.dataArray = new Uint8Array(bufferLength);
         this.microphone.connect(this.analyzer);
         this.initialized = true;
      } catch (err) {
         throw err;
      }
   }

   getFrequency(): number[] {
      if (!this.initialized) return [];
      this.analyzer.getByteFrequencyData(this.dataArray);
      let normSamples = [...this.dataArray].map(e => e / 128 - 1);
      return normSamples;
   }

   getSamples(): number[] {
      if (!this.initialized) return [];
      this.analyzer.getByteTimeDomainData(this.dataArray);
      let normSamples = [...this.dataArray].map(e => e / 128 - 1);
      return normSamples;
   }

   getVolume(): number {
      if (!this.initialized) return 0;
      this.analyzer.getByteTimeDomainData(this.dataArray);
      let sum = 0;
      const len = this.dataArray.length;
      for (let i = 0; i < len; i += 2) { // Sample every other value
         const normalized = this.dataArray[i] / 128 - 1;
         sum += normalized * normalized;
      }
      return Math.sqrt(sum / (len / 2));
   }
}