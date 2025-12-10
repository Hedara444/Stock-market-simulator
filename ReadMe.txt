1-go to PGAdmin4 and set up a new DB with the following name :  stock_sim_db .
2- go to Stock-provider/src/helpers/dbHelper.js and change the password or the port if needed.
3- go to Main-server/src/models/StockRepository.js and perform the same (if needed) changes in the step 2.
4- open command shell and do the following :
   1- `cd Stock-provider`
   2- `npm install`
   3- `npm run dev`
   ---> now the Stock provider should be up and running .
5- open another command shell and do the following :
     1- `cd Main-server`
     2- `npm install`
     3- `npm run dev`
   ---> now the main server should be up and running .


6- to test the ability of the server in handling many request , do the following :
  1- open a third command shell and type the following :
  `cd Main-server`
  `node test-traffic.js`

