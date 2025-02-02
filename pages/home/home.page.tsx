import React, { useEffect } from "react";
import styled from "styled-components/native";
import { colors } from "../../theme/colors";
import { Spacer } from "../../components/spacer.component";
import { ChatPage } from "../chat/chat.page";
import {
  Dimensions,
  ScrollView,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Dish } from "../../models/DIsh";
import { api } from "../../api/api";
import _ from "lodash";
import { CartPage } from "../cart/cart.page";
import { Message } from "../../models/Message";

export const HomePage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [inventory, setInventory] = useState<
    {
      image: string;
      name: string;
      quantity: number;
      unit: string;
      weeklyTarget: number;
    }[]
  >([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  const [cart, setCart] = useState<
    { image: string; name: string; quantity: number; unit: string }[]
  >([]);

  useEffect(() => {
    api.get("/home-page-meal-suggestions").then((response) => {
      console.log(response.data);
      setDishes(response.data);
    });
    api.get("/inventory-alert").then((response) => {
      console.log(response.data);
      setInventory(response.data.items);
    });
  }, []);

  return (
    <Container>
      <ChatPage
        {...{ messages, setMessages, isChatOpen, setIsChatOpen, cart, setCart }}
      />
      {activeTab === 0 ? (
        <>
          <Title>Hi, Aarush!</Title>
          <Paragraph>
            Take a look at the healthy suggestions we have for you today.
          </Paragraph>
          <Spacer size={20} direction="bottom" />
          <Subtitle>Recipe Suggestions</Subtitle>
          <Spacer size={10} direction="bottom" />
          <ScrollView
            style={{ maxHeight: 130, width: "100%" }}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {dishes.map((dish, index) => (
              <Spacer
                size={index !== dishes.length - 1 ? 10 : 0}
                direction="right"
                key={Math.random().toString(36)}
              >
                <TouchableOpacity
                  onPress={() => {
                    setIsChatOpen(true);
                    api
                      .post<{ recipe: { instruction: string }[] }>(
                        "/recipe-suggestion",
                        {
                          name: dish.name,
                          ingredients: dish.ingredients,
                        }
                      )
                      .then((resp) => {
                        console.log(resp.data);
                        setMessages((messages) => [
                          ...messages,
                          {
                            type: "recipe",
                            sentBy: "bot",
                            text: "Here is the recipe: ",
                            steps: resp.data.recipe,
                          },
                        ]);
                      })
                      .catch(console.log);
                    api
                      .post("/get-ingredient-info", {
                        ingredients: dish.ingredients,
                      })
                      .then((resp) => {
                        console.log(JSON.stringify(resp.data));
                        setMessages((messages) => [
                          ...messages,
                          {
                            type: "ingredients",
                            sentBy: "bot",
                            ingredients: resp.data
                              .filter((item: any) => !!item)
                              .map((item: any) => ({
                                image: item.img,
                                name: _.capitalize(item.original),
                                calories:
                                  item.nutrition.nutrients.find(
                                    (nutrient: any) =>
                                      nutrient.title === "Calories"
                                  )?.amount ?? 0,
                              })),
                            text: "Here are the ingredients you'll need. Order them?",
                          },
                        ]);
                      })
                      .catch(console.log);
                  }}
                >
                  <Card>
                    <DishName>{dish.name}</DishName>
                    <View>
                      <DishCalories>
                        {dish.nutritionalInfo.calories} cals •{" "}
                        {dish.nutritionalInfo.protein}g protein
                      </DishCalories>
                      <Spacer size={10} direction="bottom" />
                      <View style={{ flexDirection: "row", gap: 5 }}>
                        {dish.keywords?.slice(0, 2)?.map((keyword) => (
                          <Keyword key={Math.random().toString(36)}>
                            <KeywordText>{_.capitalize(keyword)}</KeywordText>
                          </Keyword>
                        ))}
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              </Spacer>
            ))}
          </ScrollView>
          <Spacer size={20} direction="bottom" />
          <Subtitle>Environmental Impact</Subtitle>
          <Spacer direction="bottom" size={10} />
          <CarbonProgressBar>
            <CarbonProgressInner></CarbonProgressInner>
          </CarbonProgressBar>
          <Spacer direction="bottom" size={5} />
          <Paragraph>
            Great job! Your sustainable grocery choices have saved 70% over
            average carbon emissions this week!
          </Paragraph>
          <Spacer size={20} direction="bottom" />
          <Subtitle>Your Pantry</Subtitle>
          <Paragraph>You're running low on some items! Reorder?</Paragraph>
          <Spacer direction="bottom" size={10} />
          <ScrollView
            style={{ maxHeight: 130, width: "100%" }}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {inventory.map((item, index) => (
              <Spacer
                size={index !== dishes.length - 1 ? 10 : 0}
                direction="right"
                key={Math.random().toString(36)}
              >
                <Card style={{ flexDirection: "row", gap: 20 }}>
                  <Image
                    source={{ uri: item.image }}
                    style={{ width: 100, height: 100 }}
                  />
                  <View style={{ alignSelf: "center" }}>
                    <DishName>{item.name}</DishName>
                    <DishCalories>
                      {item.quantity} {item.unit} left
                    </DishCalories>
                  </View>
                </Card>
              </Spacer>
            ))}
          </ScrollView>
          <View>
            <AddToCartButton
              onPress={() => {
                setCart(inventory);
              }}
            >
              <AddToCartButtonText>Add to cart</AddToCartButtonText>
            </AddToCartButton>
          </View>
        </>
      ) : (
        <CartPage cart={cart} />
      )}
      <TabsContainer>
        <TouchableOpacity onPress={() => setActiveTab(0)} style={{ flex: 1 }}>
          <Tab $active={activeTab === 0}>
            <Ionicons
              name="home"
              size={20}
              color={activeTab === 0 ? colors.white.hex : colors.text.hex}
            />
          </Tab>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab(1)} style={{ flex: 1 }}>
          <Tab $active={activeTab === 1}>
            <Ionicons
              name="cart"
              size={20}
              color={activeTab === 1 ? colors.white.hex : colors.text.hex}
            />
          </Tab>
        </TouchableOpacity>
      </TabsContainer>
    </Container>
  );
};

const windowWidth = Dimensions.get("window").width;

const Container = styled.View`
  width: 100%;
  height: 100%;
  background-color: ${colors.white.hex};
  padding: 0 30px;
  padding-top: 50px;
`;

const Title = styled.Text`
  font-size: 42px;
  font-weight: 600;
  color: ${colors.text.hex};
  font-family: "Jost";
  width: 100%;
`;

const Paragraph = styled.Text`
  font-size: 18px;
  font-weight: 400;
  font-family: "Jost";
  color: ${colors.text.hex};
`;

const Subtitle = styled.Text`
  font-size: 24px;
  font-weight: 600;
  color: ${colors.text.hex};
  font-family: "Jost";
  width: 100%;
`;

const Card = styled.View`
  padding: 10px;
  border-radius: 5px;
  background-color: ${colors.white.hex};
  /* box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); */
  border: 1px solid ${colors.text.withOpacity(0.5).hex};

  width: 265px;
  height: 125px;
`;

const TabsContainer = styled.View`
  position: absolute;
  flex-direction: row;
  height: 50px;
  bottom: 25px;
  left: 20px;
  z-index: 10;
  width: ${windowWidth - 40}px;
  background-color: ${colors.white.hex};
  border: 2px solid ${colors.primary.hex};
  border-radius: 100px;
  overflow: hidden;
`;

const Tab = styled.View`
  flex: 1;
  height: 100%;
  justify-content: center;
  align-items: center;
  background-color: ${({ $active }: { $active: boolean }) =>
    $active ? colors.primary.hex : colors.white.hex};
`;

const DishName = styled.Text`
  font-family: "Jost";
  font-size: 18px;
  font-weight: 700;
`;

const DishCalories = styled.Text`
  font-size: 16px;
  font-weight: 500;
  color: ${colors.secondary.hex};
`;

const Keyword = styled.View`
  padding: 5px 10px;
  border-radius: 100px;
  background-color: ${colors.secondary.hex};
`;

const KeywordText = styled.Text`
  color: ${colors.white.hex};
  font-size: 16px;
  font-weight: 600;
`;

const CarbonProgressBar = styled.View`
  width: 100%;
  border-radius: 100px;
  height: 25px;
  background-color: #eee;
  overflow: hidden;
`;

const CarbonProgressInner = styled.View`
  height: 100%;
  width: 70%;
  background-color: ${colors.primary.hex};
  border-radius: 100px 0 0 100px;
`;
1;

const AddToCartButton = styled.TouchableOpacity`
  background-color: ${colors.primary.hex};
  border-radius: 5px;
  padding: 10px 20px;
`;

const AddToCartButtonText = styled.Text`
  font-size: 18px;
  color: #fff;
  text-align: center;
  font-weight: 600;
`;
