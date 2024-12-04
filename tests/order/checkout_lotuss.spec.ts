import test, { expect } from "@playwright/test";

type CREDENTIALS = {
    customer_id: number
    ref_code: string
    otp_tran_id: string
    phone_number: string
    gw_access_token: string
    app_access_token: string
}

test.describe('Lotuss Checkout Flow', () => {
    let user: CREDENTIALS;

    test.beforeEach(async ({ request }) => {
        user = {
            customer_id: 20,
            ref_code: '',
            otp_tran_id: '',
            phone_number: '0642530312',
            gw_access_token: '',
            app_access_token: ''
        };

        await initializeOTP(request, user);
        await performLogin(request, user);
    });

    test('should successfully checkout from Lotuss', async ({ request }) => {
        const checkoutData = {
            customer_id: user.customer_id,
            customer_id_ref: "XXXXXX",
            seller_id: 2,
            seller_id_ref: "LOTUSGOFRESH",
            shipping_code: "ODM_GOFRESH",
            store_id: 407,
            store_id_ref: "9915",
            order_items: [
                {
                    product_id: 284497,
                    order_qty: 1,
                    normal_price: 100.0,
                    selling_price: 100.0,
                    external_product_code: "51038287",
                    variants: [],
                    options: [],
                    is_eligible_for_loyalty: 1,
                    product_qty: 9477.2
                }
            ],
            delivery_address: {
                name: "Firstname Lastname",
                address: "223 Soi 3, Sampran Rd.",
                additional_address: "25 Floor, Very hight building",
                coordinates: {
                    latitude: 13.7269056,
                    longitude: 100.5314682
                },
                sub_district: "Silom",
                district: "Bangrak",
                province: "Bangkok",
                postcode: 10500,
                phoneno: "0008683501",
                address_note: "หลังสีขาว"
            }
        };

        const response = await request.post('https://dev-app-api.amaze-x.com/r4m/v1/lotuss/checkout', {
            headers: {
                'Authorization': user.app_access_token,
                'Content-Language': 'th'
            },
            data: checkoutData
        });

        expect(response.ok()).toBeTruthy();
        const body = await response.json();
        expect(body).toBeDefined();
    });
});

async function initializeOTP(request: any, user: CREDENTIALS) {
    const response = await request.post('https://dev-app-api.amaze-x.com/r4m/v1/otp/init', {
        data: { phone_number: user.phone_number }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    user.ref_code = body.data.ref_code;
    user.otp_tran_id = body.data.otp_tran_id;
}

async function performLogin(request: any, user: CREDENTIALS) {
    const response = await request.post('https://dev-app-api.amaze-x.com/r4m/v1/users/login', {
        data: {
            device_id: "",
            otp_code: "111111",
            otp_tran_id: user.otp_tran_id,
            ref_code: user.ref_code,
            phone_number: user.phone_number,
            pdpa: {
                term: { version: "1", status_id: "1" },
                privacy_policy: { version: "1", status_id: "1" }
            }
        }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    user.gw_access_token = body.data.access_token;
    user.app_access_token = body.data.access_token;
}
