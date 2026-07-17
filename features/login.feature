Feature: Login

    Scenario: User with standard role can Login
        Given User is on login page
        When User logs in as "standard_user" with password "secret_sauce"
        Then User sees Inventory page

    Scenario: User with standard role can Login (Intentionally Fails)
        Given User is on login page
        When User logs in as "standard_user" with password "wrong_password"
        Then User sees Inventory page