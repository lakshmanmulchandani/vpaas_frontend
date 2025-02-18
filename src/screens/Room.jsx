import React, { useEffect, useState, useCallback } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";
import "./Room.css"
const Room = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  // Handle when a user joins
  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  // Get user media
  const getUserMediaStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      return stream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  }, []);

  // Call user
  const handleCallUser = useCallback(async () => {
    if (!remoteSocketId) return;
  
    const stream = await getUserMediaStream();
    peer.addStream(stream);
  
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer }); // ✅ Socket is managed in RoomPage.js
  }, [remoteSocketId, socket, getUserMediaStream]);
  

  // Incoming call
  const handleIncomingCall = useCallback(async ({ from, offer }) => {
    setRemoteSocketId(from);

    const stream = await getUserMediaStream();
    peer.addStream(stream);

    const answer = await peer.getAnswer(offer);
    socket.emit("call:accepted", { to: from, ans: answer });
  }, [socket]);

  // Handle call accepted
  const handleCallAccepted = useCallback(({ from, ans }) => {
    peer.setLocalDescription(ans);
    console.log("Call Accepted!");
  }, []);

  // Handle ICE candidate
  const handleICECandidate = useCallback(({ from, candidate }) => {
    peer.peer.addIceCandidate(new RTCIceCandidate(candidate));
  }, []);

  // Add event listeners
  useEffect(() => {
    peer.peer.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:ice-candidate", handleICECandidate);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:ice-candidate", handleICECandidate);
    };
  }, [socket, handleUserJoined, handleIncomingCall, handleCallAccepted, handleICECandidate]);

  return (
    <div className="room-container">
      <h1 className="room-title">Incubator Video Conference</h1>
      <h4 className="room-status">{remoteSocketId ? "Connected" : "No one in room"}</h4>
      {remoteSocketId && <button className="room-button" onClick={handleCallUser}>Call</button>}
      <div className="video-section">
        {myStream && (
          <div className="video-container">
            <h2>My Stream</h2>
            <video autoPlay muted playsInline ref={(video) => video && (video.srcObject = myStream)}></video>
          </div>
        )}
        {remoteStream && (
          <div className="video-container">
            <h2>Remote Stream</h2>
            <video autoPlay playsInline ref={(video) => video && (video.srcObject = remoteStream)}></video>
          </div>
        )}
      </div>
    </div>
  );
};

export default Room;
