import React, { useEffect, useRef, useState } from 'react'
import getSocket from '../utils/socket';
// import { RTCPeerConnection } from 'react-native-webrtc-web-shim';
import Peer from "simple-peer";
import styled from "styled-components";
import ReactPlayer from 'react-player';
import io from 'socket.io-client';

const socketConn = getSocket();

const Video = styled.video`
  border: 1px solid #000;
  width: 40%;
  height: 40%;
`;

function WebCommunication() {
    const socket = useRef(null);
    const peerRef = useRef(null);
    const partnerVideo = useRef(Video);
    const [streamStarted, setStreamStarted] = useState(false);
    const [remoteStream, setRemoteStream] = useState();

    const createPeer = () => {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            config: {
                iceServers: [{url: 'stun:stun.l.google.com:19302'}]
            },
            offerOptions: {
                offerToReceiveAudio: true,
                offerToReceiveVideo: true
              },
            wrtc: {
                RTCSessionDescription,
                RTCPeerConnection,
                RTCIceCandidate
            }
        });

        return peer;
    }

    const initiateCall = async() => {
        // create a initiator peer
        // an initiator peer is someone which creates an offer internally with simple-peer's signal event
        // the callback gets the sdp that is transferred to signalling server and eventually to the receiver

        peerRef.current = createPeer();

        peerRef.current.on('signal', (data) => {
            // Send the local session description to the remote peer
            // You can use a signaling server to exchange this information
            // In this example, we'll just log it
            // data which is received in the callback contains sdp offer
            socket.current.emit("offer", {sdp: data,caller:'vahanLeader',callee: 'rider'});
          });
    }

    const setPeersRemoteDesc = (data) => {

        peerRef.current.signal(data.data);
        console.log(peerRef.current);
        
        peerRef.current.on("connect", data => {
            console.log("Connection established", data);
        })

        peerRef.current.on("stream", data => {
            console.log("Streaming Data: ", data, partnerVideo);
            setRemoteStream(data);
            partnerVideo.current['srcObject'] = data
            partnerVideo.current.onloadedmetadata = function(e) {
                partnerVideo.current.play();
             };
            setStreamStarted(true);
        })
    }

    useEffect(() => {

        // Connect to the socket server
        socket.current = io.connect('http://localhost:8400', {
            transports: ["websocket"]
        });

        socket.current.on('connect', () => {
            console.log('SOCKET CONNECTED');
            socket.current.emit('mapUserIdAndSocketId',{userId:'vahanLeader', socketId: socket.current.id});
        });

        socket.current.on('newUserAdded', (data) => {
            console.log('New User Added', data);
        })

        socket.current.on('answerReceived', (data) => {
            console.log('Request Accepted', data);

            setPeersRemoteDesc(data)
        })

        return ()=> {
            socket?.current?.disconnect();
        }

    }, []);
    
  return (
    <div>
        WebCommunication
        <button onClick={initiateCall}>Send Offer</button>
        <br />
        {streamStarted && <Video playsInline ref={partnerVideo} autoPlay />}
        <br/><br/>

        {
            remoteStream && (
                <ReactPlayer
                playing
                muted
                height="300px"
                width="500px"
                url={remoteStream} />
            )
        }
        
    </div>
  )
}

export default WebCommunication
