import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useLayoutEffect,
} from 'react';
import { Image } from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import formatValue from '../../utils/formatValue';

import api from '../../services/api';

import {
  Container,
  Header,
  ScrollContainer,
  FoodsContainer,
  Food,
  FoodImageContainer,
  FoodContent,
  FoodTitle,
  FoodDescription,
  FoodPricing,
  AdditionalsContainer,
  Title,
  TotalContainer,
  AdittionalItem,
  AdittionalItemText,
  AdittionalQuantity,
  PriceButtonContainer,
  TotalPrice,
  QuantityContainer,
  FinishOrderButton,
  ButtonText,
  IconContainer,
} from './styles';

interface Params {
  id: number;
}

interface Extra {
  id: number;
  name: string;
  value: number;
  quantity: number;
}

interface Food {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  formattedPrice: string;
  extras: Extra[];
}

const FoodDetails: React.FC = () => {
  const [food, setFood] = useState({} as Food);
  const [extras, setExtras] = useState<Extra[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [foodQuantity, setFoodQuantity] = useState(1);

  const [favorites, setFavorites] = useState<Food[]>([]);

  const navigation = useNavigation();
  const route = useRoute();

  const routeParams = route.params as Params;

  useEffect(() => {
    async function loadFood(): Promise<void> {
      // Load a specific food with extras based on routeParams id
      const { data: responseData } = await api.get(`foods/${routeParams.id}`);

      if (responseData.extras) {
        const extrasWithQuantities = responseData.extras.map(
          (extraItem: any) => {
            return { ...extraItem, quantity: 0 };
          },
        );
        setExtras(extrasWithQuantities);

        setFood({
          ...responseData,
          formattedPrice: formatValue(responseData.price),
          extras: extrasWithQuantities,
        });
      } else {
        setExtras([]);
        setFood({
          ...responseData,
          formattedPrice: formatValue(responseData.price),
        });
      }
    }

    loadFood();
  }, [routeParams]);

  useEffect(() => {
    async function loadFavorites(): Promise<void> {
      const { data: responseDataFavorites } = await api.get('favorites');

      setFavorites(responseDataFavorites || []);

      const favorite = responseDataFavorites.filter(
        (favItem: any) => favItem.id === food.id,
      );

      setIsFavorite(favorite.length > 0);
    }

    loadFavorites();
  }, [food.id]);

  function handleIncrementExtra(id: number): void {
    // Increment extra quantity
    const extrasWithUpdatedQuantities = extras.map((extraItem: Extra) => {
      const updatedExtra =
        extraItem.id === id
          ? { ...extraItem, quantity: extraItem.quantity + 1 }
          : extraItem;
      return updatedExtra;
    });

    setExtras(extrasWithUpdatedQuantities);
    setFood({ ...food, extras: extrasWithUpdatedQuantities });
  }

  function handleDecrementExtra(id: number): void {
    // Decrement extra quantity
    const extrasWithUpdatedQuantities = extras.map((extraItem: Extra) => {
      const updatedExtra =
        extraItem.id === id && extraItem.quantity > 0
          ? { ...extraItem, quantity: extraItem.quantity - 1 }
          : extraItem;
      return updatedExtra;
    });

    setExtras(extrasWithUpdatedQuantities);
    setFood({ ...food, extras: extrasWithUpdatedQuantities });
  }

  function handleIncrementFood(): void {
    // Increment food quantity
    setFoodQuantity(foodQuantity + 1);
  }

  function handleDecrementFood(): void {
    // Decrement food quantity
    foodQuantity > 1 && setFoodQuantity(foodQuantity - 1);
  }

  const toggleFavorite = useCallback(async () => {
    // Toggle if food is favorite or not
    if (isFavorite) {
      setIsFavorite(false);
      await api.delete(`favorites/${food.id}`);
    } else {
      setIsFavorite(true);
      await api.post('favorites', food);
    }
  }, [isFavorite, food]);

  const cartTotal = useMemo(() => {
    // Calculate cartTotal
    let extrasPrice = 0;

    extras.forEach(extraItem => {
      extrasPrice += extraItem.quantity * extraItem.value;
    });

    return formatValue((food.price + extrasPrice) * foodQuantity);
  }, [extras, food, foodQuantity]);

  // {
  //   "id": 1,
  //   "product_id": 1,
  //   "name": "Ao molho",
  //   "description": "Macarrão ao molho branco, fughi e cheiro verde das montanhas.",
  //   "price": 19.9,
  //   "category": 1,
  //   "thumbnail_url": "https://storage.googleapis.com/golden-wind/bootcamp-gostack/desafio-gorestaurant-mobile/ao_molho.png",
  //   "extras": [
  //     {
  //       "id": 4,
  //       "name": "Bacon",
  //       "value": 1.5,
  //       "quantity": 1
  //     }
  //   ]
  // }

  async function handleFinishOrder(): Promise<void> {
    // Finish the order and save on the API

    const order = { ...food, product_id: food.id } as any;
    delete order.id;
    await api.post('orders', order);
  }

  // Calculate the correct icon name
  const favoriteIconName = useMemo(
    () => (isFavorite ? 'favorite' : 'favorite-border'),
    [isFavorite],
  );

  useLayoutEffect(() => {
    // Add the favorite icon on the right of the header bar
    navigation.setOptions({
      headerRight: () => (
        <MaterialIcon
          name={favoriteIconName}
          size={24}
          color="#FFB84D"
          onPress={() => toggleFavorite()}
        />
      ),
    });
  }, [navigation, favoriteIconName, toggleFavorite]);

  return (
    <Container>
      <Header />

      <ScrollContainer>
        <FoodsContainer>
          <Food>
            <FoodImageContainer>
              <Image
                style={{ width: 327, height: 183 }}
                source={{
                  uri: food.image_url,
                }}
              />
            </FoodImageContainer>
            <FoodContent>
              <FoodTitle>{food.name}</FoodTitle>
              <FoodDescription>{food.description}</FoodDescription>
              <FoodPricing>{food.formattedPrice}</FoodPricing>
            </FoodContent>
          </Food>
        </FoodsContainer>
        <AdditionalsContainer>
          <Title>Adicionais</Title>
          {extras.map(extra => (
            <AdittionalItem key={extra.id}>
              <AdittionalItemText>{extra.name}</AdittionalItemText>
              <AdittionalQuantity>
                <Icon
                  size={15}
                  color="#6C6C80"
                  name="minus"
                  onPress={() => handleDecrementExtra(extra.id)}
                  testID={`decrement-extra-${extra.id}`}
                />
                <AdittionalItemText testID={`extra-quantity-${extra.id}`}>
                  {extra.quantity}
                </AdittionalItemText>
                <Icon
                  size={15}
                  color="#6C6C80"
                  name="plus"
                  onPress={() => handleIncrementExtra(extra.id)}
                  testID={`increment-extra-${extra.id}`}
                />
              </AdittionalQuantity>
            </AdittionalItem>
          ))}
        </AdditionalsContainer>
        <TotalContainer>
          <Title>Total do pedido</Title>
          <PriceButtonContainer>
            <TotalPrice testID="cart-total">{cartTotal}</TotalPrice>
            <QuantityContainer>
              <Icon
                size={15}
                color="#6C6C80"
                name="minus"
                onPress={handleDecrementFood}
                testID="decrement-food"
              />
              <AdittionalItemText testID="food-quantity">
                {foodQuantity}
              </AdittionalItemText>
              <Icon
                size={15}
                color="#6C6C80"
                name="plus"
                onPress={handleIncrementFood}
                testID="increment-food"
              />
            </QuantityContainer>
          </PriceButtonContainer>

          <FinishOrderButton onPress={() => handleFinishOrder()}>
            <ButtonText>Confirmar pedido</ButtonText>
            <IconContainer>
              <Icon name="check-square" size={24} color="#fff" />
            </IconContainer>
          </FinishOrderButton>
        </TotalContainer>
      </ScrollContainer>
    </Container>
  );
};

export default FoodDetails;
