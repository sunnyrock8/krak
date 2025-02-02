import styled from "styled-components/native";
import { colors } from "../../theme/colors";
import { Image, View } from "react-native";
import { Spacer } from "../../components/spacer.component";

export const CartPage = ({
  cart,
}: {
  cart: { image: string; name: string; quantity: number; unit: string }[];
}) => {
  return (
    <Container>
      <Title>My Cart</Title>
      <Paragraph>Check out with one click.</Paragraph>
      <Spacer direction="bottom" size={20} />
      {cart.map((item) => (
        <Item key={Math.random().toString(36)}>
          <Image
            source={{ uri: item.image }}
            style={{ width: 100, height: 100 }}
          />
          <View style={{ marginLeft: 10 }}>
            <ProductName>{item.name}</ProductName>
            <ProductQuantity>
              {item.quantity} {item.unit}
            </ProductQuantity>
          </View>
        </Item>
      ))}
    </Container>
  );
};

const Container = styled.View`
  width: 100%;
  height: 100%;
  background-color: ${colors.white.hex};
`;

const Title = styled.Text`
  font-size: 42px;
  font-weight: 600;
  color: ${colors.text.hex};
  font-family: "Jost";
  width: 100%;
`;

const ProductName = styled(Title)`
  font-size: 30px;
`;

const ProductQuantity = styled(ProductName)`
  font-size: 18px;
  font-weight: 500;
`;

const Paragraph = styled.Text`
  font-size: 18px;
  font-weight: 400;
  font-family: "Jost";
  color: ${colors.text.hex};
`;

const Item = styled.View`
  flex-direction: row;
  width: 100%;
  gap: 10px;
  margin-bottom: 10px;
`;
