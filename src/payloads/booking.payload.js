export function createBookingPayload() {
  return {
    firstname: 'Jim',
    lastname: 'Brown',
    totalprice: 111,
    depositpaid: true,
    bookingdates: {
      checkin: '2018-01-01',
      checkout: '2019-01-01',
    },
    additionalneeds: 'Breakfast',
  };
}

export function fullUpdateBookingPayload() {
  return {
    firstname: 'James',
    lastname: 'Brown',
    totalprice: 111,
    depositpaid: true,
    bookingdates: {
      checkin: '2018-01-01',
      checkout: '2019-01-01',
    },
    additionalneeds: 'Breakfast',
  };
}

export function partialUpdateBookingPayload() {
  return {
    firstname: 'James',
    lastname: 'Brown',
  };
}
