

1- open command shell and do the following :
   1- `cd Stock-provider`
   2- `npm install`
   3- `npm run dev`
   ---> now the Stock provider should be up and running .
2- open another command shell and do the following :
     1- `cd Main-server`
     2- `npm install`
     3- `npm run dev`
   ---> now the main server should be up and running .


3- to test the ability of the server in handling many request , do the following :
  1- open a third command shell and type the following :
  `cd Main-server`
  `node test-traffic.js`

4-you will need to utilize postman  in order to test the work flow :
 --> after importing the postman collection , you will need to add this  Globals :
   baseURL  :  http://localhost:4000
   Admintoken : mock-admin-token-1
   serverB-URL : http://localhost:5000