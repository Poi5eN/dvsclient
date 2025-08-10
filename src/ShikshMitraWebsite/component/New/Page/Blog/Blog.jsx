import React from 'react';
import { motion } from 'framer-motion';
import { RichTextEditor } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { FiSearch, FiCalendar, FiUser } from 'react-icons/fi';

// Sample blog posts data
const blogPosts = [
  {
    id: 1,
    title: "Transforming Education with Technology",
    excerpt: "Discover how modern tools are revolutionizing school management and student engagement.",
    date: "June 15, 2025",
    author: "John Doe",
    image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 2,
    title: "The Future of Learning: Trends to Watch",
    excerpt: "Explore emerging trends shaping the education landscape in 2025 and beyond.",
    date: "June 10, 2025",
    author: "Jane Smith",
    image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=871&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: 3,
    title: "Empowering Teachers with Digital Tools",
    excerpt: "Learn how digital platforms can enhance teaching efficiency and student outcomes.",
    date: "June 5, 2025",
    author: "Emily Johnson",
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644",
  },
];

const Blog = () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<h2>Create a New Blog Post</h2><p>Share your insights and updates with our community.</p>',
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="py-16 text-center bg-[#ee5828] text-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 py-5">Our Blog</h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto">
            Dive into the latest insights, trends, and updates in education technology.
          </p>
          <div className="mt-6 flex justify-center">
            <div className="relative w-full max-w-md">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search blog posts..."
                className="w-full pl-10 pr-4 py-2 rounded-full bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2fa7db]"
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* Blog Posts Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {blogPosts.map((post) => (
            <motion.div
              key={post.id}
              variants={cardVariants}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h2 className="text-xl font-bold text-[#ee5828] dark:text-[#ee5828] mb-2">
                  {post.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {post.excerpt}
                </p>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <FiCalendar className="mr-2" />
                  <span>{post.date}</span>
                  <FiUser className="ml-4 mr-2" />
                  <span>{post.author}</span>
                </div>
                <a
                  href="#"
                  className="mt-4 inline-block text-[#2fa7db] hover:text-[#ee5828] font-semibold"
                >
                  Read More
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Rich Text Editor for Blog Creation */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg"
        >
          <h2 className="text-2xl font-bold text-[#ee5828] dark:text-[#ee5828] mb-6">
            Write a New Post
          </h2>
          <RichTextEditor editor={editor} className="border-none">
            <RichTextEditor.Toolbar
              sticky
              stickyOffset={60}
              className="bg-gray-100 dark:bg-gray-700 rounded-t-lg"
            >
              <RichTextEditor.ControlsGroup>
                <RichTextEditor.Bold />
                <RichTextEditor.Italic />
                <RichTextEditor.Underline />
                <RichTextEditor.H1 />
                <RichTextEditor.H2 />
                <RichTextEditor.H3 />
                <RichTextEditor.Link />
                <RichTextEditor.Unlink />
                <RichTextEditor.BulletList />
                <RichTextEditor.OrderedList />
              </RichTextEditor.ControlsGroup>
            </RichTextEditor.Toolbar>
            <RichTextEditor.Content className="min-h-[200px] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-b-lg" />
          </RichTextEditor>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-4 bg-[#ee5828] text-white px-6 py-2 rounded-full hover:bg-[#2fa7db] transition-colors"
          >
            Publish Post
          </motion.button>
        </motion.div>
      </section>

      {/* Newsletter Subscription */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="bg-[#2fa7db] text-white py-12"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="text-lg mb-6">
            Stay updated with the latest education trends and insights.
          </p>
          <div className="flex justify-center">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full max-w-md px-4 py-2 rounded-l-full bg-white text-gray-900 focus:outline-none"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#ee5828] px-6 py-2 rounded-r-full hover:bg-[#ee5828]/80 transition-colors"
            >
              Subscribe
            </motion.button>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default Blog;