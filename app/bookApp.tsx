import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

// ---------- Type ----------
type Book = {
  id: string;
  title: string;
  author?: string;
  year?: number | null;
};

// ---------- Constants ----------
const STORAGE_KEY = '@books_storage_v1';

// ---------- Component ----------
export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [year, setYear] = useState('');

  useEffect(() => {
    loadBooks();
  }, []);

  async function loadBooks() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setBooks(JSON.parse(raw));
    } catch (e) {
      console.error('Failed to load books', e);
    }
  }

  async function saveBooks(newBooks: Book[]) {
    try {
      setBooks(newBooks);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newBooks));
    } catch (e) {
      console.error('Failed to save books', e);
    }
  }

  function openCreate() {
    setEditingBook(null);
    setTitle('');
    setAuthor('');
    setYear('');
    setModalVisible(true);
  }

  function openEdit(book: Book) {
    setEditingBook(book);
    setTitle(book.title);
    setAuthor(book.author || '');
    setYear(book.year ? String(book.year) : '');
    setModalVisible(true);
  }

  async function onSave() {
    if (!title.trim()) return Alert.alert('Validation', 'Please enter title');
    const safeYear = parseInt(year) || null;
    if (editingBook) {
      const updated = books.map((b: Book) =>
        b.id === editingBook.id ? { ...b, title: title.trim(), author: author.trim(), year: safeYear } : b
      );
      await saveBooks(updated);
    } else {
      const id = Date.now().toString();
      const newBook: Book = { id, title: title.trim(), author: author.trim(), year: safeYear };
      await saveBooks([newBook, ...books]);
    }
    setModalVisible(false);
  }

  function onDelete(book: Book) {
    Alert.alert('Delete', `Delete \"${book.title}\"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const filtered = books.filter((b: Book) => b.id !== book.id);
          await saveBooks(filtered);
        }
      }
    ]);
  }

  function renderItem({ item }: { item: Book }) {
    return (
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.meta}>{item.author || 'Unknown author'} • {item.year || '—'}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.btnSmall} onPress={() => openEdit(item)}>
            <Text style={styles.btnSmallText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnSmall, { backgroundColor: '#ff6b6b' }]} onPress={() => onDelete(item)}>
            <Text style={styles.btnSmallText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Book CRUD • Expo</Text>
        <TouchableOpacity style={styles.addButton} onPress={openCreate}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={books}
        keyExtractor={(item: Book) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={() => (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: '#666' }}>No books yet — press + Add to create one.</Text>
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{editingBook ? 'Edit Book' : 'New Book'}</Text>
          <TextInput value={title} onChangeText={setTitle} placeholder="Title" style={styles.input} />
          <TextInput value={author} onChangeText={setAuthor} placeholder="Author" style={styles.input} />
          <TextInput value={year} onChangeText={setYear} placeholder="Year" style={styles.input} keyboardType="numeric" />

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={[styles.btn, { flex: 1 }]} onPress={onSave}>
              <Text style={styles.btnText}>{editingBook ? 'Save' : 'Create'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnOutline, { flex: 1 }]} onPress={() => setModalVisible(false)}>
              <Text style={[styles.btnText, { color: '#333' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fb' },
  header: { flexDirection: 'row', padding: 16, alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  addButton: { backgroundColor: '#2563eb', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  addButtonText: { color: '#fff', fontWeight: '600' },
  card: { backgroundColor: '#fff', padding: 14, marginBottom: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6 },
  title: { fontSize: 16, fontWeight: '700' },
  meta: { color: '#666', marginTop: 4 },
  actions: { marginLeft: 12, alignItems: 'flex-end' },
  btnSmall: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#ffd166', marginBottom: 6 },
  btnSmallText: { fontWeight: '600' },
  modalContainer: { flex: 1, padding: 20, backgroundColor: '#fff' },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#eee', padding: 12, borderRadius: 10, marginBottom: 12, backgroundColor: '#fbfbfb' },
  btn: { backgroundColor: '#06b6d4', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 6 },
  btnText: { color: '#fff', fontWeight: '700' },
  btnOutline: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' }
});