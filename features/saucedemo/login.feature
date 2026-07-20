@login
Feature: Login

    Background:
        Given User is on login page

    Scenario: User with standard role can Login
        When User logs in as "standard_user" with password "secret_sauce"
        Then User sees Inventory page

    @failureExample
    Scenario: User with standard role can Login (Intentionally Fails)
        When User logs in as "standard_user" with password "wrong_password"
        Then User sees Inventory page