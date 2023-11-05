const data = {
  products: [
    {
      product: '6545e3f6b3b1151e98bd14a5',
      quantity: 3,
    },
    {
      product: '6545e3b1b3b1151e98bd14a4',
      quantity: 4,
    },
  ],
};

const headers = {
  Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1NDVlNjhmMjNjYjNkMjRmN2ZjZWE1YiIsImlhdCI6MTY5OTA5MTY3NSwiZXhwIjoxNjk5MTI3Njc1fQ.KTocxZw1eoGVizEibtIO1P2411icadGGEeLYTv6dI2o',
  'Content-Type': 'application/json',
};

fetch('http://localhost:5000/api/v1/orders', {
  method: 'POST',
  headers,
  body: JSON.stringify(data),
})
  .then(response => response.json())
  .then(data => {
    console.log('Respon:', data);
  })
  .catch(error => {
    console.error('Kesalahan:', error);
  });
