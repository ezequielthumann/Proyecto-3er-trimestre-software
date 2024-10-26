import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/FirebaseConfig';

export default function TemasScreen({ navigation }){
  const [temasList, setTemasList] = useState([]);

  useEffect(() => {
    const fetchTemas = async () => {
      const snapshot = await getDocs(collection(db, 'temas'));
      const temas = [];
      snapshot.forEach((doc) => {
        temas.push({ ...doc.data(), id: doc.id });
      });
      setTemasList(temas);
    };
    
    fetchTemas();
  }, []);

  return (
    <ScrollView style={styles.container}>
      {temasList.map((tema) => (
        <View key={tema.id} style={styles.card}>
          <Text style={styles.title}>{tema.title}</Text>
          <Text style={styles.description}>{tema.description}</Text>
          <Text style={styles.author}>Creado por: {tema.author}</Text>
          <Text style={styles.date}>Fecha: {tema.createdAt.toDate().toLocaleDateString()}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  card: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginBottom: 15,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  description: {
    marginTop: 5,
    fontSize: 15,
    color: '#666',
  },
  author: {
    marginTop: 10,
    fontSize: 14,
    color: '#888',
  },
  date: {
    marginTop: 5,
    fontSize: 12,
    color: '#aaa',
  },
});
