// // utils/ipfsUpload.ts
// import pinataSDK from '@pinata/sdk';



// export const UploadToIPFS = async (file)=> {

//   const pinata = pinataSDK(
//   "f0568269d2418906b0e1",
//   "f62ebe35c3756f9e28818e6deb6bed136d3211a67ef3a394b9f3f1925e6b4011"
// );

//   const formData = new FormData();
//   formData.append('file', file);

//   const buffer = await file.arrayBuffer();
//   const blob = new Blob([buffer]);

//   const readableStream = new Response(blob).body;

//   if (!readableStream) throw new Error('Failed to create readable stream');

//   const stream = readableStream ;

//   const result = await pinata.pinFileToIPFS(stream, {
//     pinataMetadata: {
//       name: file.name,
//     },
//   });
//   console.log("result string : " , `ipfs://${result.IpfsHash}`)

//   return `ipfs://${result.IpfsHash}`;
// };





export const UploadToIPFS = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      pinata_api_key: 'f0568269d2418906b0e1',
      pinata_secret_api_key: 'f62ebe35c3756f9e28818e6deb6bed136d3211a67ef3a394b9f3f1925e6b4011',
    },
    body: formData,
  });

  const result = await res.json();

  if (!res.ok) {
    console.error('Pinata upload error:', result);
    throw new Error(result.error || 'Failed to upload to IPFS');
  }

  return `ipfs://${result.IpfsHash}`;
};
