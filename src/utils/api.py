
def send_get_request(self, path, headers):
    response = self.client.get(path, headers=headers)
    if response.status_code == 200:
        print("API call successful")
    else:
        print(f"API call failed with status code: {response.status_code}")


def send_post_request(self, path, headers, payload):
    response = self.client.post(path, headers=headers, json=payload)

    if response.status_code == 200:
        print("POST request successful")
    else:
        print(f"POST request failed with status code: {response.status_code}")
