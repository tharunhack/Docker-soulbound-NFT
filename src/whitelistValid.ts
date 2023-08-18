import dotenv from "dotenv";
import server from "./app";
dotenv.config();


export function queryPromise(query: string, values?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    server.mysql.query(query, values, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

export async function checkAndInsertAddress(address: string) {
 try {
   const selectQuery = `SELECT eoa_address, is_eligible FROM soulboundNFT WHERE eoa_address = ?`;
   const selectResult: any = await queryPromise(selectQuery, [address]);

   if (selectResult.length > 0) {
     return { exists: true, isEligible: selectResult[0].is_eligible === 1 };
   } else {
     const insertQuery = `INSERT INTO soulboundNFT (eoa_address, is_eligible) VALUES (?, true)`;
     await queryPromise(insertQuery, [address]);
     return { exists: false, isEligible: true };
   }
 } catch (error: any) {
   console.error("Error:", error);
   if (error.code === "ER_DUP_ENTRY") {
     throw new Error("Address already exists in the database");
   }
   throw error;
 }
}
