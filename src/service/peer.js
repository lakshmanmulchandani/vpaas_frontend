import { io } from "socket.io-client"; // ✅ Import socket.io-client

class PeerService {
  constructor() {
    if (!this.peer) {
      this.peer = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:global.stun.twilio.com:3478" },
          {
            urls: "turn:yourturnserver.com",
            username: "user",
            credential: "password",
          },
        ],
      });
    }
  }

  async getAnswer(offer) {
    if (this.peer) {
      await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
      const ans = await this.peer.createAnswer();
      await this.peer.setLocalDescription(ans);
      return ans;
    }
  }

  async setLocalDescription(ans) {
    if (this.peer) {
      await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
    }
  }

  async getOffer() {
    if (this.peer) {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(offer);
      return offer;
    }
  }

  async addStream(stream) {
    if (this.peer) {
      stream.getTracks().forEach((track) => this.peer.addTrack(track, stream));
    }
  }
}

export default new PeerService();
