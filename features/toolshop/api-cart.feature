@toolshop
Feature: Items in cart match items returned by API

    Background:
        Given User is on toolshop products page

    @apiUi
    Scenario: User can see the same items in their cart that is from the API
        When User selects product "Claw Hammer" from list
        Then User sees the correct product details
        When User adds product to cart
        And User navigates to cart
        Then User can see correct items in cart
        And User sees correct cart total