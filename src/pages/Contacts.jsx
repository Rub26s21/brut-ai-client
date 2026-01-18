/**
 * Contacts Page
 * Manage customer contacts with CRUD operations
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { contactsApi, messagesApi } from '../lib/api';
import { Plus, Edit, Trash2, Loader, Sparkles, X } from 'lucide-react';

export default function Contacts() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingContact, setEditingContact] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        dob: '',
        tone: 'friendly',
    });
    const [generatedMessage, setGeneratedMessage] = useState('');
    const [generatingMessage, setGeneratingMessage] = useState(false);

    useEffect(() => {
        loadContacts();
    }, []);

    const loadContacts = async () => {
        try {
            setLoading(true);
            const data = await contactsApi.getAll(supabase);
            setContacts(data);
        } catch (error) {
            console.error('Error loading contacts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingContact) {
                await contactsApi.update(supabase, editingContact.id, formData);
            } else {
                await contactsApi.create(supabase, formData);
            }
            loadContacts();
            closeModal();
        } catch (error) {
            console.error('Error saving contact:', error);
            alert('Failed to save contact');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this contact?')) return;

        try {
            await contactsApi.delete(supabase, id);
            loadContacts();
        } catch (error) {
            console.error('Error deleting contact:', error);
            alert('Failed to delete contact');
        }
    };

    const handleEdit = (contact) => {
        setEditingContact(contact);
        setFormData({
            name: contact.name,
            email: contact.email,
            dob: contact.dob,
            tone: contact.tone,
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingContact(null);
        setFormData({ name: '', email: '', dob: '', tone: 'friendly' });
        setGeneratedMessage('');
    };

    const handleGenerateMessage = async () => {
        if (!formData.name) {
            alert('Please enter a name first');
            return;
        }

        try {
            setGeneratingMessage(true);
            const { data: { user } } = await supabase.auth.getUser();
            const { data: profile } = await supabase
                .from('profiles')
                .select('business_name')
                .eq('id', user.id)
                .single();

            const result = await messagesApi.generate(supabase, {
                name: formData.name,
                tone: formData.tone,
                businessName: profile?.business_name || 'Our Team',
            });

            setGeneratedMessage(result.message);
        } catch (error) {
            console.error('Error generating message:', error);
            alert('Failed to generate message');
        } finally {
            setGeneratingMessage(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader className="animate-spin text-blue-600" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Contacts
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage your customer contacts
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={20} />
                    Add Contact
                </button>
            </div>

            {/* Contacts Table */}
            <div className="card overflow-hidden">
                {contacts.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            No contacts yet. Add your first customer!
                        </p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="btn-primary inline-flex items-center gap-2"
                        >
                            <Plus size={20} />
                            Add Contact
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Birthday
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Tone
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {contacts.map((contact) => (
                                    <tr key={contact.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {contact.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                                            {contact.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                                            {new Date(contact.dob).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                                {contact.tone}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                            <button
                                                onClick={() => handleEdit(contact)}
                                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(contact.id)}
                                                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">
                                    {editingContact ? 'Edit Contact' : 'Add New Contact'}
                                </h2>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input-field"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="input-field"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Date of Birth</label>
                                    <input
                                        type="date"
                                        value={formData.dob}
                                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                        className="input-field"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Message Tone</label>
                                    <select
                                        value={formData.tone}
                                        onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                                        className="input-field"
                                    >
                                        <option value="friendly">Friendly</option>
                                        <option value="professional">Professional</option>
                                        <option value="formal">Formal</option>
                                    </select>
                                </div>

                                {/* AI Message Preview */}
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-medium">AI Message Preview</label>
                                        <button
                                            type="button"
                                            onClick={handleGenerateMessage}
                                            disabled={generatingMessage}
                                            className="btn-secondary text-sm flex items-center gap-2"
                                        >
                                            {generatingMessage ? (
                                                <>
                                                    <Loader className="animate-spin" size={16} />
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles size={16} />
                                                    Generate
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    {generatedMessage && (
                                        <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                            <p className="whitespace-pre-line text-sm">{generatedMessage}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button type="submit" className="btn-primary flex-1">
                                        {editingContact ? 'Update Contact' : 'Add Contact'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="btn-secondary flex-1"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
