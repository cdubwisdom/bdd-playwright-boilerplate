@inventory
Feature: User can view and add items to cart

    Background:
        Given User is on login page
        When User logs in as "standard_user" with password "secret_sauce"
        Then User sees Inventory page

    @itemDetails
    Scenario Outline: User sees correct item details
        When User sees the inventory list
        Then User sees correct details for <itemName>
        Examples:
            | itemName |
            | "Sauce Labs Backpack" |
            | "Sauce Labs Bike Light" |

    @cart
    Scenario: User can add items to cart
        When User adds "Sauce Labs Backpack" to the cart
        And User adds "Sauce Labs Bike Light" to the cart
        Then User sees "2" items in the cart

    @cart
    Scenario: User can remove items from cart
        When User adds "Sauce Labs Backpack" to the cart
        And User adds "Sauce Labs Bike Light" to the cart
        When User removes "Sauce Labs Backpack" from the cart
        Then User sees "1" items in the cart