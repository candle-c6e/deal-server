import { Response } from "express";
import { ObjectId } from "mongodb";
import { RequestCustom } from "../../lib/types";

export const getChatRoom = async (req: RequestCustom, res: Response) => {
  const { userId } = req.params;

  const Chats = req.database?.chats
  const Users = req.database?.users

  let chatRooms = [];

  const chats = await Chats?.find({
    participant: {
      $in: [new ObjectId(userId)],
    },
  })
    .sort({ updatedAt: -1 })
    .toArray();

  if (chats?.length) {
    for (let chat of chats) {
      let user;
      if (String(userId) === String(chat.participant[0])) {
        user = await Users?.findOne({
          _id: new ObjectId(chat.participant[1]),
        });
      } else {
        user = await Users?.findOne({
          _id: new ObjectId(chat.participant[0]),
        });
      }

      chatRooms.push({
        roomId: chat._id,
        userId: user?._id,
        name: user?.name,
        avatar: user?.avartar,
        deviceToken: user?.deviceToken,
        lastMessage: chat.messages[chat.messages.length - 1],
        active: false,
      });
    }
  }

  return res.status(200).json({
    success: true,
    data: chatRooms,
  });
}

export const getChatByRoomId = async (req: RequestCustom, res: Response) => {
  const page = req.params.page;
  const skip = (+page - 1) * 50;

  const Chats = req.database?.chats

  const chats = await Chats?.aggregate([
    {
      $match: { _id: new ObjectId(req.params.roomId) },
    },
    {
      $project: {
        _id: 0,
        messages: 1,
      },
    },
    {
      $unwind: {
        path: "$messages",
      },
    },
    {
      $sort: {
        "messages.timestamp": -1,
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: 50,
    },
    {
      $group: {
        _id: null,
        messages: {
          $push: "$messages",
        },
      },
    },
  ]).toArray();

  return res.status(200).json({
    success: true,
    data: chats?.length ? chats : [],
  });
}