Feature: Users API
  As an API consumer
  I want to retrieve users
  So that I can access their profile information

  Scenario: Get users successfully
    Given the API base url is configured
    When I send a "GET" request to "/users"
    Then the response status should be 200
    And the response content type should be JSON
    And the response body should be a non-empty array
    And the response body should contain "0.id" with value 1
    And each user should contain the following fields
      | field    | type   |
      | id       | number |
      | name     | string |
      | company  | string |
      | username | string |
      | email    | string |
      | address  | string |
      | zip      | string |
      | state    | string |
      | country  | string |
      | phone    | string |
      | photo    | string |
    And each user should have a unique positive integer id
