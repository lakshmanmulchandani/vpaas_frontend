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

      // Handle ICE candidate gathering
      this.peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("peer:ice-candidate", { candidate: event.candidate });
        }
      };
    }
  }

  async getAnswer(offer) {
    if (this.peer) {
      await this.peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peer.createAnswer();
      await this.peer.setLocalDescription(answer);
      return answer;
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
