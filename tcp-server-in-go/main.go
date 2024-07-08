package main

import (
	"fmt"
	"net"
	)

func main(){
	listener,err := net.Listen("tcp", ":8080")
	if err != nil{
		fmt.Println(err)
		return
	}

	 // Accepting incoming connections
	 for{
		conn, err := listener.Accept() // a blocking system call
		if err != nil{
			fmt.Println(err)
			return
		}

		go handleConnection(conn) // implements coroutine ie spawning a new thread
	 }

	fmt.Println("Hello World")
}

func handleConnection(conn net.Conn){
	
	buffer := make([]byte, 1024) // a byte array of size 1024
	_,err := conn.Read(buffer) // reading the data sent from cleint, again a blocking system call (no of bytes(n) , error)

	if err != nil{
		fmt.Println(err)
		return
	}

	conn.Write([]byte("HTTP/1.1 200 OK\r\n\r\nHello World\r\n")) // writing the data back to the client so that curl understands it, again a blocking system call
	conn.Close() 
}