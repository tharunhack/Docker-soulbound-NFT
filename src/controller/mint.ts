import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { mintNft } from "../soulBound";
import { ethers } from "ethers";
import { hashMessage } from "ethers/lib/utils";
import dotenv from "dotenv";
import server from "../app";
dotenv.config();

const test = async () => {
  const wallet = ethers.Wallet.createRandom();
  console.log("wallet: ", wallet);
  const message = "Hello World";
  const signature = await wallet.signMessage(message);
  console.log("Signature:", signature);
};
test();

export default async function mint(fastify: FastifyInstance) {
  fastify.get(
    "/",
    async function (
      request: FastifyRequest<{ Querystring: { tokenURI: any } }>,
      reply: FastifyReply
    ) {
      const { tokenURI } = request.query;
      const signature = request.headers["signature"] as string;
      if (!signature) {
        reply.code(401).send({ message: "signature not available" });
      }
      const verifiedSigner = ethers.utils.recoverAddress(
        hashMessage(process.env.SIGN_MSG as string),
        signature
      );
      console.log("verifiedSigner", verifiedSigner);

      if (!verifiedSigner) {
        reply.code(401).send({ message: "Address not provided" });
        return;
      }
      const isValidSig = `SELECT eoa_address, is_eligible, is_claimed FROM soulboundNFT WHERE eoa_address = ?`;
      server.mysql.query(isValidSig, [verifiedSigner], (error: any, results:any) => {
        if (error) {
          console.log("error: ", error);
          reply.code(500).send({ message: "Internal Server Error" });
        } else {
          if (results.length === 0 || results[0].eoa_address !== verifiedSigner ) {
            reply
              .code(401)
              .send({ message: "Address not eligible or not in DB" });
              return;
          } else {
            const { is_eligible, is_claimed } = results[0];
            switch (true) {
              case (is_eligible === 0 && is_claimed === 0):
                reply
                  .code(401)
                  .send({
                    message: "Address is not eligible, and not claimed",
                  });
                break;
              case (is_eligible === 0 && is_claimed === 1):
                reply.code(401).send({ message: "Address is already claimed"})
                break;
            }
          }
        }
      });
      try {
        const mintHash = await mintNft(verifiedSigner, tokenURI);
        reply.send({ mintHash });
        // Update isclaimed to true after minting
        const updateIsClaimedQuery = `UPDATE soulboundNFT SET is_claimed = 1 WHERE eoa_address = ?`;
        server.mysql.query(
          updateIsClaimedQuery,
          [verifiedSigner],
          (updateError) => {
            if (updateError) {
              reply
                .code(500)
                .send({ message: "Failed to update isclaimed status" });
            }
          }
        );
      } catch (error) {
        console.log(error);
        reply.send({
          Error: error,
        });
      }
    }
  );
}
