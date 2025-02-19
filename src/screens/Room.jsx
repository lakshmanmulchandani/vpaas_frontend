import React, { useEffect, useState, useCallback } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";
import { mjpegToMediaStream } from "../mjpegToMediaStream"; // Import MJPEG conversion function

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

  // Get MJPEG media stream
  const getMJPEGStream = useCallback(async () => {
    try {
      const stream = await mjpegToMediaStream("http://localhost:5000"); // MJPEG stream URL
      setMyStream(stream);
      return stream;
    } catch (error) {
      console.error("Error accessing MJPEG stream:", error);
    }
  }, []);

  // Call user
  const handleCallUser = useCallback(async () => {
    if (!remoteSocketId) return;

    const stream = await getMJPEGStream();
    peer.addStream(stream);

    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer }); // ✅ Socket is managed in RoomPage.js
  }, [remoteSocketId, socket, getMJPEGStream]);

  // Incoming call
  const handleIncomingCall = useCallback(async ({ from, offer }) => {
    setRemoteSocketId(from);

    const stream = await getMJPEGStream();
    peer.addStream(stream);

    const answer = await peer.getAnswer(offer);
    socket.emit("call:accepted", { to: from, ans: answer });
  }, [socket, getMJPEGStream]);

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
    <div>
      <h1>Room Page</h1>
      <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>
      {remoteSocketId && <button onClick={handleCallUser}>Call</button>}
      {myStream && (
        <>
          <h1>My Stream</h1>
          <ReactPlayer playing muted height="500px" width="1000px" url={myStream} />
        </>
      )}
      {remoteStream && (
        <>
          <h1>Remote Stream</h1>
          <ReactPlayer playing height="500px" width="1000px" url={remoteStream} />
        </>
      )}
    </div>
  );
};

export default Room;