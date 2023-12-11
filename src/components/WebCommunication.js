import React, { useEffect, useRef, useState } from 'react'
import getSocket from '../utils/socket';
// import { RTCPeerConnection } from 'react-native-webrtc-web-shim';
import Peer from "simple-peer";
import styled from "styled-components";

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
    const [stream, setStream] = useState(null);

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
        // const peer = new Peer({
        //     initiator: true,
        //     trickle: false,
        //     config: {
        //         iceServers: [{url: 'stun:stun.l.google.com:19302'}]
        //     },
        // });

        peerRef.current = createPeer();

        peerRef.current.on('signal', (data) => {
            // Send the local session description to the remote peer
            // You can use a signaling server to exchange this information
            // In this example, we'll just log it
            // data which is received in the callback contains sdp offer
            console.log('Local SDP:', data);
            socket.current.emit("offer", {sdp: data,caller:'vahanLeader',callee: 'rider'});
          });
    }

    const acceptCall = async() => {
        // create a initiator peer
        // an initiator peer is someone which creates an offer internally with simple-peer's signal event
        // the callback gets the sdp that is transferred to signalling server and eventually to the receiver
        const peer = new Peer({
            initiator: false,
            trickle: false,
            config: {
                iceServers: [
                    {
                        urls: "stun:numb.viagenie.ca",
                        username: "sultan1640@gmail.com",
                        credential: "98376683"
                    },
                    {
                        urls: "turn:numb.viagenie.ca",
                        username: "sultan1640@gmail.com",
                        credential: "98376683"
                    }
                ]
            },
        });

        peer.on('signal', (data) => {
            // Send the local session description to the remote peer
            // You can use a signaling server to exchange this information
            // In this example, we'll just log it
            // data which is received in the callback contains sdp offer
            console.log('Remote SDP:', data);
          });
    }

    const setPeersRemoteDesc = (data) => {

        // peerRef.current.on("signal", data => {
        //     console.log(data, 'Signal post getting SDP answer');
        // });

        peerRef.current.signal(data.data);
        console.log(peerRef.current);
        
        peerRef.current.on("connect", data => {
            console.log("Connection established", data);
        })

        peerRef.current.on("stream", data => {
            console.log("Streaming Data: ", data, partnerVideo);
            // if(Object.keys(partnerVideo).contain) {
            //     partnerVideo.current.srcObject = data;
            // }
            partnerVideo.current['srcObject'] = data;
            partnerVideo.current.onloadedmetadata = function(e) {
                partnerVideo.current.play();
                };
            // setStream(data);
            setStreamStarted(true);
        })
    }

    useEffect(() => {
      socket.current = socketConn;

        socket.current.on('newUserAdded', (data) => {
            console.log('New User Added', data);
        })

        socket.current.on('answerReceived', (data) => {
            console.log('Request Accepted', data);

            setPeersRemoteDesc(data)
        })

    //   initiateCall();
    //   acceptCall();
    }, []);

    useEffect(() => {
        if(socket?.current?.id){
            socket?.current.emit('mapUserIdAndSocketId',{userId:'vahanLeader', socketId: socket.current.id});
        }
    }, [socket])

    // let PartnerVideo;
    // if(streamStarted) {
    //     PartnerVideo = (<Video playsInline ref={partnerVideo} autoPlay />);
    // }
    
  return (
    <div>
        WebCommunication
        <button onClick={initiateCall}>Send Offer</button>
        <br />
        {streamStarted && <Video playsInline ref={partnerVideo} autoPlay />}
        {/* {PartnerVideo} */}
    </div>
  )
}

export default WebCommunication
