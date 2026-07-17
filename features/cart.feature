Feature: Add Items to Cart

    Background:
        Given User is on login page
        When User logs in as "standard_user" with password "secret_sauce"

    Scenario: User can add items to cart
        Then User sees Inventory page
        When User adds "Sauce Labs Backpack" to the cart
        And User adds "Sauce Labs Bike Light" to the cart
        Then User sees "2" items in the cart