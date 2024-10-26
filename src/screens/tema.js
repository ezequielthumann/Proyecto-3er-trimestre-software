import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList } from 'react-native';
import { doc, getDoc, collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/FirebaseConfig';

export default function TemaScreen({ navigation, route }) {
  const { temaId } = route.params;
  const [tema, setTema] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);

  useEffect(() => {
    // Obtener los datos del tema
    const fetchTema = async () => {
      const docRef = doc(db, 'temas', temaId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setTema({ ...docSnap.data(), id: docSnap.id });
      } else {
        console.log("No existe tal documento!");
      }
    };

    // Escuchar cambios en los comentarios en tiempo real
    const commentsRef = collection(db, 'temas', temaId, 'comentarios');
    const commentsQuery = query(commentsRef, orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate().toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }),
      }));
      setComments(commentsData);
    });

    fetchTema();

    // Limpia el listener cuando el componente se desmonta
    return () => unsubscribe();
  }, [temaId]);

  const handleCommentSubmit = async () => {
    if (commentText.trim()) {
      const commentsRef = collection(db, 'temas', temaId, 'comentarios');
      await addDoc(commentsRef, {
        author: "Usuario actual",  // Reemplazar por el nombre del usuario actual
        commentText,
        createdAt: serverTimestamp(),
      });
      setCommentText(''); // Limpiar el campo después de enviar el comentario
    }
  };

  if (!tema) {
    return (
      <View style={styles.loading}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{tema.title}</Text>
      <Text style={styles.description}>{tema.description}</Text>
      <Text style={styles.author}>Creado por: {tema.author}</Text>
      <Text style={styles.date}>Fecha: {tema.createdAt.toDate().toLocaleDateString()}</Text>

      <Text style={styles.commentsTitle}>Comentarios:</Text>
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.comment}>
            <Text style={styles.commentAuthor}>{item.author}</Text>
            <Text>{item.commentText}</Text>
            <Text style={styles.commentDate}>{item.createdAt}</Text>
          </View>
        )}
      />

      <TextInput
        style={styles.input}
        placeholder="Escribe tu comentario..."
        value={commentText}
        onChangeText={setCommentText}
      />
      <Button title="Enviar comentario" onPress={handleCommentSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  description: {
    marginTop: 10,
    fontSize: 16,
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
  commentsTitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
  },
  comment: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 5,
  },
  commentAuthor: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  commentDate: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 5,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
