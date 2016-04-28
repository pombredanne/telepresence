# Telepresence.app
An Electron based application which can be used to automate telepresence between remote offices.  We're
using [room.co](http://room.co) to handle the heavy lifting of the video chat.  Upon first launch the
application will ask the user for a Conference ID, this prefix is a secret key inserted into the Room.co
channel name.  Each instance of the application with the same Conference ID will automatically connect to
the correct channel.  Subsequent launches of the app will go straight to the channel and enter fullscreen mode
for the remote office.

## Suggested Setup
1. Mac Mini
1. Large Television
1. [Logitech C930E webcam](http://smile.amazon.com/Logitech-C930e-960-000971-Video-Webcam/dp/B00CRJWW2G/)
1. [Blue Snowball Condenser Microphone](http://smile.amazon.com/Blue-Microphones-Snowball-Black-iCE/dp/B014PYGTUQ/)


#### License [MIT](LICENSE.md)
